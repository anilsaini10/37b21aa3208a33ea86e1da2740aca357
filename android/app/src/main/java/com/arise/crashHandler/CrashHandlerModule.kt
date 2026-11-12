package com.arise.crashHandler

import android.app.ActivityManager
import android.content.Context
import android.os.BatteryManager
import android.os.Build
import android.os.Handler
import android.os.Looper
import android.util.Log
import com.facebook.react.bridge.*
import org.json.JSONObject
import java.io.File
import java.io.FileWriter
import java.io.PrintWriter
import java.io.StringWriter
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

class CrashHandlerModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    private val TAG = "CrashHandler"
    private val crashDir: File
        get() = File(reactContext.filesDir, "crash_reports").also { it.mkdirs() }

    private var originalHandler: Thread.UncaughtExceptionHandler? = null
    private var anrWatchdog: Thread? = null

    override fun getName() = "CrashHandler"

    private fun getDeviceInfo(): JSONObject {
        val info = JSONObject()
        info.put("platform", "ANDROID")
        info.put("osVersion", "Android ${Build.VERSION.RELEASE}")
        info.put("deviceModel", "${Build.MANUFACTURER} ${Build.MODEL}")
        try {
            val pInfo = reactContext.packageManager.getPackageInfo(reactContext.packageName, 0)
            info.put("appVersion", pInfo.versionName ?: "unknown")
            info.put("buildNumber", pInfo.longVersionCode.toString())
        } catch (_: Exception) {
            info.put("appVersion", "unknown")
            info.put("buildNumber", "0")
        }
        return info
    }

    private fun getMemoryMb(): Long {
        try {
            val am = reactContext.getSystemService(Context.ACTIVITY_SERVICE) as? ActivityManager
            val mi = ActivityManager.MemoryInfo()
            am?.getMemoryInfo(mi)
            return mi.availMem / (1024 * 1024)
        } catch (_: Exception) { return -1 }
    }

    private fun getBatteryLevel(): Int {
        try {
            val bm = reactContext.getSystemService(Context.BATTERY_SERVICE) as? BatteryManager
            return bm?.getIntProperty(BatteryManager.BATTERY_PROPERTY_CAPACITY) ?: -1
        } catch (_: Exception) { return -1 }
    }

    @ReactMethod
    fun install(promise: Promise) {
        try {
            if (originalHandler != null) {
                promise.resolve(true)
                return
            }
            originalHandler = Thread.getDefaultUncaughtExceptionHandler()
            Thread.setDefaultUncaughtExceptionHandler { thread, throwable ->
                writeNativeCrashFile(thread, throwable)
                originalHandler?.uncaughtException(thread, throwable)
            }
            startAnrWatchdog()
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("INSTALL_ERROR", e.message)
        }
    }

    @ReactMethod
    fun logJsError(message: String, stackTrace: String, errorType: String, isFatal: Boolean, promise: Promise) {
        try {
            val timestamp = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.US).format(Date())
            val deviceInfo = getDeviceInfo()

            val json = JSONObject()
            json.put("errorMessage", message.take(5000))
            json.put("stackTrace", stackTrace.take(50000))
            json.put("errorType", errorType.take(200))
            json.put("isFatal", isFatal)
            json.put("crashedAt", timestamp)
            json.put("platform", deviceInfo.getString("platform"))
            json.put("appVersion", deviceInfo.getString("appVersion"))
            json.put("buildNumber", deviceInfo.getString("buildNumber"))
            json.put("osVersion", deviceInfo.getString("osVersion"))
            json.put("deviceModel", deviceInfo.getString("deviceModel"))

            val metadata = JSONObject()
            metadata.put("freeMemory", getMemoryMb().toString())
            metadata.put("batteryLevel", getBatteryLevel().toString())
            json.put("metadata", metadata)

            val fileName = "crash_${if (isFatal) "fatal" else "error"}_${System.currentTimeMillis()}.json"
            val file = File(crashDir, fileName)
            FileWriter(file).use { it.write(json.toString()) }

            Log.e(TAG, "JS ${if (isFatal) "FATAL" else "ERROR"} logged: $fileName")
            promise.resolve(fileName)
        } catch (e: Exception) {
            promise.reject("LOG_ERROR", e.message)
        }
    }

    @ReactMethod
    fun getPendingCrashes(promise: Promise) {
        try {
            val result = Arguments.createArray()
            val files = crashDir.listFiles { f -> f.name.endsWith(".json") }
                ?.sortedByDescending { it.lastModified() } ?: emptyList()

            for (file in files) {
                try {
                    val map = Arguments.createMap()
                    map.putString("fileName", file.name)
                    map.putString("payload", file.readText())
                    map.putDouble("timestamp", file.lastModified().toDouble())
                    result.pushMap(map)
                } catch (_: Exception) {}
            }
            promise.resolve(result)
        } catch (e: Exception) {
            promise.reject("READ_ERROR", e.message)
        }
    }

    @ReactMethod
    fun deleteCrashFile(fileName: String, promise: Promise) {
        try {
            val file = File(crashDir, fileName)
            val deleted = if (file.exists()) file.delete() else true
            promise.resolve(deleted)
        } catch (e: Exception) {
            promise.reject("DELETE_ERROR", e.message)
        }
    }

    @ReactMethod
    fun clearAllCrashFiles(promise: Promise) {
        try {
            var count = 0
            crashDir.listFiles()?.forEach {
                if (it.delete()) count++
            }
            promise.resolve(count)
        } catch (e: Exception) {
            promise.reject("CLEAR_ERROR", e.message)
        }
    }

    @ReactMethod
    fun getDeviceMetadata(promise: Promise) {
        try {
            val deviceInfo = getDeviceInfo()
            val map = Arguments.createMap().apply {
                putString("platform", deviceInfo.getString("platform"))
                putString("osVersion", deviceInfo.getString("osVersion"))
                putString("deviceModel", deviceInfo.getString("deviceModel"))
                putString("appVersion", deviceInfo.getString("appVersion"))
                putString("buildNumber", deviceInfo.getString("buildNumber"))
                putDouble("freeMemory", getMemoryMb().toDouble())
                putInt("batteryLevel", getBatteryLevel())
            }
            promise.resolve(map)
        } catch (e: Exception) {
            promise.reject("METADATA_ERROR", e.message)
        }
    }

    private fun writeNativeCrashFile(thread: Thread, throwable: Throwable) {
        try {
            val timestamp = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.US).format(Date())
            val sw = StringWriter()
            throwable.printStackTrace(PrintWriter(sw))
            val deviceInfo = getDeviceInfo()

            val json = JSONObject()
            json.put("errorMessage", (throwable.message ?: throwable.javaClass.simpleName).take(5000))
            json.put("stackTrace", sw.toString().take(50000))
            json.put("errorType", throwable.javaClass.simpleName.take(200))
            json.put("isFatal", true)
            json.put("crashedAt", timestamp)
            json.put("platform", deviceInfo.getString("platform"))
            json.put("appVersion", deviceInfo.getString("appVersion"))
            json.put("buildNumber", deviceInfo.getString("buildNumber"))
            json.put("osVersion", deviceInfo.getString("osVersion"))
            json.put("deviceModel", deviceInfo.getString("deviceModel"))

            val metadata = JSONObject()
            metadata.put("thread", thread.name)
            metadata.put("freeMemory", getMemoryMb().toString())
            metadata.put("batteryLevel", getBatteryLevel().toString())
            json.put("metadata", metadata)

            val fileName = "crash_native_${System.currentTimeMillis()}.json"
            val file = File(crashDir, fileName)
            FileWriter(file).use { it.write(json.toString()) }

            Log.e(TAG, "Native crash written: $fileName")
        } catch (e: Exception) {
            Log.e(TAG, "Failed to write native crash", e)
        }
    }

    private fun startAnrWatchdog() {
        if (anrWatchdog != null) return
        anrWatchdog = Thread {
            val handler = Handler(Looper.getMainLooper())
            while (!Thread.currentThread().isInterrupted) {
                try {
                    val responded = java.util.concurrent.atomic.AtomicBoolean(false)
                    handler.post { responded.set(true) }
                    Thread.sleep(5000)
                    if (!responded.get()) {
                        writeAnrFile()
                    }
                } catch (_: InterruptedException) {
                    break
                }
            }
        }.apply {
            name = "ANRWatchdog"
            isDaemon = true
            start()
        }
    }

    private fun writeAnrFile() {
        try {
            val timestamp = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.US).format(Date())
            val mainThread = Looper.getMainLooper().thread
            val sw = StringWriter()
            val pw = PrintWriter(sw)
            for (el in mainThread.stackTrace) {
                pw.println("  at $el")
            }
            val deviceInfo = getDeviceInfo()

            val json = JSONObject()
            json.put("errorMessage", "Application Not Responding — main thread blocked > 5s")
            json.put("stackTrace", sw.toString().take(50000))
            json.put("errorType", "ANR")
            json.put("isFatal", false)
            json.put("crashedAt", timestamp)
            json.put("platform", deviceInfo.getString("platform"))
            json.put("appVersion", deviceInfo.getString("appVersion"))
            json.put("buildNumber", deviceInfo.getString("buildNumber"))
            json.put("osVersion", deviceInfo.getString("osVersion"))
            json.put("deviceModel", deviceInfo.getString("deviceModel"))

            val metadata = JSONObject()
            metadata.put("freeMemory", getMemoryMb().toString())
            metadata.put("batteryLevel", getBatteryLevel().toString())
            json.put("metadata", metadata)

            val fileName = "crash_anr_${System.currentTimeMillis()}.json"
            val file = File(crashDir, fileName)
            FileWriter(file).use { it.write(json.toString()) }

            Log.w(TAG, "ANR detected and logged: $fileName")
        } catch (e: Exception) {
            Log.e(TAG, "Failed to write ANR report", e)
        }
    }
}
