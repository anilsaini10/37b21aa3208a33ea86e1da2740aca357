package com.arise.cacheManager

import com.facebook.react.bridge.*
import java.io.File
import java.io.FileOutputStream
import java.net.HttpURLConnection
import java.net.URL
import java.security.MessageDigest

class CacheManagerModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName() = "CacheManager"

    @ReactMethod
    fun getCacheSize(promise: Promise) {
        Thread {
            try {
                val internalCache = dirSize(reactContext.cacheDir)
                val externalCache = reactContext.externalCacheDir?.let { dirSize(it) } ?: 0L
                val total = internalCache + externalCache

                val map = Arguments.createMap().apply {
                    putDouble("internal", internalCache.toDouble())
                    putDouble("external", externalCache.toDouble())
                    putDouble("total", total.toDouble())
                    putString("formatted", formatBytes(total))
                }
                promise.resolve(map)
            } catch (e: Exception) {
                promise.reject("CACHE_SIZE_ERROR", e.message)
            }
        }.start()
    }

    @ReactMethod
    fun clearCache(promise: Promise) {
        Thread {
            try {
                var freed = 0L
                freed += clearDir(reactContext.cacheDir)
                reactContext.externalCacheDir?.let { freed += clearDir(it) }

                val map = Arguments.createMap().apply {
                    putDouble("freedBytes", freed.toDouble())
                    putString("freedFormatted", formatBytes(freed))
                    putBoolean("success", true)
                }
                promise.resolve(map)
            } catch (e: Exception) {
                promise.reject("CLEAR_CACHE_ERROR", e.message)
            }
        }.start()
    }

    @ReactMethod
    fun clearExpiredCache(maxAgeMs: Double, promise: Promise) {
        Thread {
            try {
                val cutoff = System.currentTimeMillis() - maxAgeMs.toLong()
                var freed = 0L
                freed += clearOlderThan(reactContext.cacheDir, cutoff)
                reactContext.externalCacheDir?.let { freed += clearOlderThan(it, cutoff) }

                val map = Arguments.createMap().apply {
                    putDouble("freedBytes", freed.toDouble())
                    putString("freedFormatted", formatBytes(freed))
                    putBoolean("success", true)
                }
                promise.resolve(map)
            } catch (e: Exception) {
                promise.reject("CLEAR_EXPIRED_ERROR", e.message)
            }
        }.start()
    }

    @ReactMethod
    fun getAppStorageInfo(promise: Promise) {
        Thread {
            try {
                val internalCache = dirSize(reactContext.cacheDir)
                val externalCache = reactContext.externalCacheDir?.let { dirSize(it) } ?: 0L
                val filesDir = dirSize(reactContext.filesDir)
                val total = internalCache + externalCache + filesDir

                val map = Arguments.createMap().apply {
                    putDouble("cacheSize", (internalCache + externalCache).toDouble())
                    putString("cacheSizeFormatted", formatBytes(internalCache + externalCache))
                    putDouble("dataSize", filesDir.toDouble())
                    putString("dataSizeFormatted", formatBytes(filesDir))
                    putDouble("totalSize", total.toDouble())
                    putString("totalSizeFormatted", formatBytes(total))
                }
                promise.resolve(map)
            } catch (e: Exception) {
                promise.reject("STORAGE_INFO_ERROR", e.message)
            }
        }.start()
    }

    private val imageCacheDir: File
        get() = File(reactContext.filesDir, "image_cache").also { it.mkdirs() }

    private fun urlToFileName(url: String): String {
        val digest = MessageDigest.getInstance("SHA-256")
        val hash = digest.digest(url.toByteArray()).joinToString("") { "%02x".format(it) }
        val ext = when {
            url.contains(".png", ignoreCase = true) -> ".png"
            url.contains(".webp", ignoreCase = true) -> ".webp"
            url.contains(".gif", ignoreCase = true) -> ".gif"
            else -> ".jpg"
        }
        return hash.take(32) + ext
    }

    @ReactMethod
    fun cacheImage(remoteUrl: String, promise: Promise) {
        Thread {
            try {
                val fileName = urlToFileName(remoteUrl)
                val file = File(imageCacheDir, fileName)

                if (file.exists()) {
                    promise.resolve("file://" + file.absolutePath)
                    return@Thread
                }

                val connection = URL(remoteUrl).openConnection() as HttpURLConnection
                connection.connectTimeout = 15000
                connection.readTimeout = 15000
                connection.connect()

                if (connection.responseCode != HttpURLConnection.HTTP_OK) {
                    promise.reject("DOWNLOAD_ERROR", "HTTP ${connection.responseCode}")
                    return@Thread
                }

                val tempFile = File(imageCacheDir, "$fileName.tmp")
                connection.inputStream.use { input ->
                    FileOutputStream(tempFile).use { output ->
                        input.copyTo(output)
                    }
                }
                tempFile.renameTo(file)

                promise.resolve("file://" + file.absolutePath)
            } catch (e: Exception) {
                promise.reject("CACHE_IMAGE_ERROR", e.message)
            }
        }.start()
    }

    @ReactMethod
    fun getCachedImage(remoteUrl: String, promise: Promise) {
        try {
            val fileName = urlToFileName(remoteUrl)
            val file = File(imageCacheDir, fileName)
            if (file.exists()) {
                promise.resolve("file://" + file.absolutePath)
            } else {
                promise.resolve(null)
            }
        } catch (e: Exception) {
            promise.reject("CACHED_IMAGE_ERROR", e.message)
        }
    }

    @ReactMethod
    fun removeCachedImage(remoteUrl: String, promise: Promise) {
        try {
            val fileName = urlToFileName(remoteUrl)
            val file = File(imageCacheDir, fileName)
            if (file.exists()) file.delete()
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("REMOVE_IMAGE_ERROR", e.message)
        }
    }

    @ReactMethod
    fun clearImageCache(promise: Promise) {
        Thread {
            try {
                val freed = clearDir(imageCacheDir)
                val map = Arguments.createMap().apply {
                    putDouble("freedBytes", freed.toDouble())
                    putString("freedFormatted", formatBytes(freed))
                    putBoolean("success", true)
                }
                promise.resolve(map)
            } catch (e: Exception) {
                promise.reject("CLEAR_IMAGE_CACHE_ERROR", e.message)
            }
        }.start()
    }

    @ReactMethod
    fun getImageCacheSize(promise: Promise) {
        Thread {
            try {
                val size = dirSize(imageCacheDir)
                val map = Arguments.createMap().apply {
                    putDouble("bytes", size.toDouble())
                    putString("formatted", formatBytes(size))
                }
                promise.resolve(map)
            } catch (e: Exception) {
                promise.reject("IMAGE_CACHE_SIZE_ERROR", e.message)
            }
        }.start()
    }

    private fun dirSize(dir: File): Long {
        if (!dir.exists()) return 0
        var size = 0L
        val files = dir.listFiles() ?: return 0
        for (file in files) {
            size += if (file.isDirectory) dirSize(file) else file.length()
        }
        return size
    }

    private fun clearDir(dir: File): Long {
        if (!dir.exists()) return 0
        var freed = 0L
        val files = dir.listFiles() ?: return 0
        for (file in files) {
            freed += if (file.isDirectory) {
                val size = dirSize(file)
                file.deleteRecursively()
                size
            } else {
                val size = file.length()
                file.delete()
                size
            }
        }
        return freed
    }

    private fun clearOlderThan(dir: File, cutoff: Long): Long {
        if (!dir.exists()) return 0
        var freed = 0L
        val files = dir.listFiles() ?: return 0
        for (file in files) {
            if (file.isDirectory) {
                freed += clearOlderThan(file, cutoff)
                if (file.listFiles()?.isEmpty() == true) file.delete()
            } else if (file.lastModified() < cutoff) {
                freed += file.length()
                file.delete()
            }
        }
        return freed
    }

    private fun formatBytes(bytes: Long): String {
        if (bytes < 1024) return "$bytes B"
        val kb = bytes / 1024.0
        if (kb < 1024) return String.format("%.1f KB", kb)
        val mb = kb / 1024.0
        if (mb < 1024) return String.format("%.1f MB", mb)
        val gb = mb / 1024.0
        return String.format("%.2f GB", gb)
    }
}
