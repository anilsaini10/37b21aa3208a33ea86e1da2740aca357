package com.arise.imagePicker

import android.app.Activity
import android.content.Intent
import android.content.pm.PackageManager
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Matrix
import android.media.ExifInterface
import android.net.Uri
import android.os.Build
import android.provider.MediaStore
import androidx.core.content.FileProvider
import com.facebook.react.bridge.*
import java.io.File
import java.io.FileOutputStream

class ImagePickerModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext), ActivityEventListener {

    private var pickerPromise: Promise? = null
    private var cameraPhotoFile: File? = null
    private val PICK_REQUEST = 9211
    private val CAMERA_REQUEST = 9212

    init {
        reactContext.addActivityEventListener(this)
    }

    override fun getName() = "ImagePicker"

    @ReactMethod
    fun compressImage(uriString: String, maxSize: Int, quality: Int, promise: Promise) {
        Thread {
            try {
                val resolver = reactContext.contentResolver
                val uri = Uri.parse(uriString)

                val bounds = BitmapFactory.Options().apply { inJustDecodeBounds = true }
                resolver.openInputStream(uri)?.use { BitmapFactory.decodeStream(it, null, bounds) }

                var sample = 1
                while (bounds.outWidth / sample > maxSize * 2 || bounds.outHeight / sample > maxSize * 2) {
                    sample *= 2
                }

                val decodeOpts = BitmapFactory.Options().apply { inSampleSize = sample }
                val src = resolver.openInputStream(uri)?.use {
                    BitmapFactory.decodeStream(it, null, decodeOpts)
                } ?: throw Exception("Image decode failed")

                val orientation = resolver.openInputStream(uri)?.use {
                    ExifInterface(it).getAttributeInt(
                        ExifInterface.TAG_ORIENTATION, ExifInterface.ORIENTATION_NORMAL
                    )
                } ?: ExifInterface.ORIENTATION_NORMAL

                val matrix = Matrix()
                when (orientation) {
                    ExifInterface.ORIENTATION_ROTATE_90 -> matrix.postRotate(90f)
                    ExifInterface.ORIENTATION_ROTATE_180 -> matrix.postRotate(180f)
                    ExifInterface.ORIENTATION_ROTATE_270 -> matrix.postRotate(270f)
                    ExifInterface.ORIENTATION_FLIP_HORIZONTAL -> matrix.postScale(-1f, 1f)
                    ExifInterface.ORIENTATION_FLIP_VERTICAL -> matrix.postScale(1f, -1f)
                }

                val longest = maxOf(src.width, src.height)
                if (longest > maxSize) {
                    val scale = maxSize.toFloat() / longest
                    matrix.postScale(scale, scale)
                }

                var out = Bitmap.createBitmap(src, 0, 0, src.width, src.height, matrix, true)

                if (out.hasAlpha()) {
                    val bg = Bitmap.createBitmap(out.width, out.height, Bitmap.Config.ARGB_8888)
                    val canvas = Canvas(bg)
                    canvas.drawColor(Color.WHITE)
                    canvas.drawBitmap(out, 0f, 0f, null)
                    out = bg
                }

                val file = File(reactContext.cacheDir, "compressed_${System.currentTimeMillis()}.jpg")
                FileOutputStream(file).use { out.compress(Bitmap.CompressFormat.JPEG, quality, it) }

                val map = Arguments.createMap().apply {
                    putString("uri", "file://" + file.absolutePath)
                    putString("type", "image/jpeg")
                    putString("name", file.name)
                    putDouble("size", file.length().toDouble())
                    putInt("width", out.width)
                    putInt("height", out.height)
                }
                promise.resolve(map)
            } catch (e: Exception) {
                promise.reject("COMPRESS_ERROR", e.message)
            }
        }.start()
    }

    @ReactMethod
    fun pickImage(promise: Promise) {
        val activity = reactContext.currentActivity
        if (activity == null) {
            promise.reject("NO_ACTIVITY", "Activity not available")
            return
        }
        if (pickerPromise != null) {
            promise.reject("BUSY", "Picker already open")
            return
        }
        pickerPromise = promise
        val intent = Intent(Intent.ACTION_GET_CONTENT).apply {
            type = "image/*"
            addCategory(Intent.CATEGORY_OPENABLE)
        }
        activity.startActivityForResult(Intent.createChooser(intent, "Select Image"), PICK_REQUEST)
    }

    @ReactMethod
    fun captureImage(promise: Promise) {
        val activity = reactContext.currentActivity
        if (activity == null) {
            promise.reject("NO_ACTIVITY", "Activity not available")
            return
        }
        if (pickerPromise != null) {
            promise.reject("BUSY", "Picker already open")
            return
        }

        val pm = activity.packageManager
        if (!pm.hasSystemFeature(PackageManager.FEATURE_CAMERA_ANY)) {
            promise.reject("NO_CAMERA", "Device has no camera")
            return
        }

        pickerPromise = promise
        val photoFile = File(reactContext.cacheDir, "camera_${System.currentTimeMillis()}.jpg")
        cameraPhotoFile = photoFile

        val photoUri = FileProvider.getUriForFile(
            reactContext,
            "${reactContext.packageName}.fileprovider",
            photoFile
        )

        val intent = Intent(MediaStore.ACTION_IMAGE_CAPTURE).apply {
            putExtra(MediaStore.EXTRA_OUTPUT, photoUri)
            addFlags(Intent.FLAG_GRANT_WRITE_URI_PERMISSION)
        }
        activity.startActivityForResult(intent, CAMERA_REQUEST)
    }

    override fun onActivityResult(activity: Activity, requestCode: Int, resultCode: Int, data: Intent?) {
        if (requestCode != PICK_REQUEST && requestCode != CAMERA_REQUEST) return
        val promise = pickerPromise ?: return
        pickerPromise = null

        if (resultCode != Activity.RESULT_OK) {
            cameraPhotoFile = null
            promise.reject("CANCELLED", "User cancelled")
            return
        }

        try {
            when (requestCode) {
                PICK_REQUEST -> {
                    val uri = data?.data
                    if (uri == null) {
                        promise.reject("ERROR", "No image selected")
                        return
                    }
                    val mime = reactContext.contentResolver.getType(uri) ?: "image/jpeg"
                    val ext = if (mime.contains("png")) "png" else "jpg"
                    val file = File(reactContext.cacheDir, "pick_${System.currentTimeMillis()}.$ext")
                    reactContext.contentResolver.openInputStream(uri)?.use { input ->
                        FileOutputStream(file).use { out -> input.copyTo(out) }
                    }
                    val map = Arguments.createMap().apply {
                        putString("uri", "file://" + file.absolutePath)
                        putString("type", mime)
                        putString("name", file.name)
                        putDouble("size", file.length().toDouble())
                    }
                    promise.resolve(map)
                }

                CAMERA_REQUEST -> {
                    val file = cameraPhotoFile
                    cameraPhotoFile = null
                    if (file == null || !file.exists()) {
                        promise.reject("ERROR", "Camera photo not found")
                        return
                    }
                    val map = Arguments.createMap().apply {
                        putString("uri", "file://" + file.absolutePath)
                        putString("type", "image/jpeg")
                        putString("name", file.name)
                        putDouble("size", file.length().toDouble())
                    }
                    promise.resolve(map)
                }
            }
        } catch (e: Exception) {
            cameraPhotoFile = null
            promise.reject("ERROR", e.message)
        }
    }

    override fun onNewIntent(intent: Intent) {}
}
