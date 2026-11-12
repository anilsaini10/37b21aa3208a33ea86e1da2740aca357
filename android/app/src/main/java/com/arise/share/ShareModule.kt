package com.arise.share

import android.content.Intent
import android.net.Uri
import androidx.core.content.FileProvider
import com.facebook.react.bridge.*
import java.io.File

class ShareModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName() = "AriseShare"

    @ReactMethod
    fun open(options: ReadableMap, promise: Promise) {
        try {
            val intent = Intent(Intent.ACTION_SEND)

            val message = if (options.hasKey("message")) options.getString("message") else null
            val url = if (options.hasKey("url")) options.getString("url") else null
            val type = if (options.hasKey("type")) options.getString("type") else null
            val title = if (options.hasKey("title")) options.getString("title") else null
            val filename = if (options.hasKey("filename")) options.getString("filename") else null

            if (url != null && (url.startsWith("file://") || url.startsWith("/"))) {
                val filePath = url.removePrefix("file://")
                val file = File(filePath)
                if (!file.exists()) {
                    promise.reject("FILE_NOT_FOUND", "File does not exist: $filePath")
                    return
                }

                val contentUri = FileProvider.getUriForFile(
                    reactContext,
                    "${reactContext.packageName}.fileprovider",
                    file,
                )
                intent.putExtra(Intent.EXTRA_STREAM, contentUri)
                intent.type = type ?: getMimeType(file.name)
                intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
            } else if (url != null && url.startsWith("data:")) {
                val dataFile = dataUriToFile(url, filename)
                if (dataFile != null) {
                    val contentUri = FileProvider.getUriForFile(
                        reactContext,
                        "${reactContext.packageName}.fileprovider",
                        dataFile,
                    )
                    intent.putExtra(Intent.EXTRA_STREAM, contentUri)
                    intent.type = type ?: getMimeType(dataFile.name)
                    intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
                } else {
                    intent.type = type ?: "text/plain"
                }
            } else {
                intent.type = type ?: "text/plain"
                if (url != null) {
                    val text = if (message != null) "$message\n$url" else url
                    intent.putExtra(Intent.EXTRA_TEXT, text)
                }
            }

            if (message != null && !intent.hasExtra(Intent.EXTRA_TEXT)) {
                intent.putExtra(Intent.EXTRA_TEXT, message)
            }
            if (title != null) {
                intent.putExtra(Intent.EXTRA_SUBJECT, title)
            }

            val chooser = Intent.createChooser(intent, title ?: "Share")
            chooser.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)

            val resInfo = reactContext.packageManager.queryIntentActivities(chooser, 0)
            for (ri in resInfo) {
                val packageName = ri.activityInfo.packageName
                if (intent.hasExtra(Intent.EXTRA_STREAM)) {
                    reactContext.grantUriPermission(
                        packageName,
                        intent.getParcelableExtra(Intent.EXTRA_STREAM),
                        Intent.FLAG_GRANT_READ_URI_PERMISSION,
                    )
                }
            }

            reactContext.startActivity(chooser)
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("SHARE_ERROR", e.message)
        }
    }

    private fun dataUriToFile(dataUri: String, filename: String?): File? {
        return try {
            val commaIndex = dataUri.indexOf(',')
            if (commaIndex < 0) return null

            val meta = dataUri.substring(5, commaIndex)
            val base64Data = dataUri.substring(commaIndex + 1)
            val bytes = android.util.Base64.decode(base64Data, android.util.Base64.DEFAULT)

            val ext = when {
                meta.contains("spreadsheetml") -> ".xlsx"
                meta.contains("pdf") -> ".pdf"
                meta.contains("png") -> ".png"
                meta.contains("jpeg") || meta.contains("jpg") -> ".jpg"
                else -> ".bin"
            }

            val name = filename ?: "shared_${System.currentTimeMillis()}"
            val file = File(reactContext.cacheDir, "$name$ext")
            file.writeBytes(bytes)
            file
        } catch (_: Exception) {
            null
        }
    }

    private fun getMimeType(fileName: String): String {
        val ext = fileName.substringAfterLast('.', "").lowercase()
        return when (ext) {
            "pdf" -> "application/pdf"
            "png" -> "image/png"
            "jpg", "jpeg" -> "image/jpeg"
            "xlsx" -> "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            "xls" -> "application/vnd.ms-excel"
            "csv" -> "text/csv"
            "txt" -> "text/plain"
            "doc" -> "application/msword"
            "docx" -> "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            else -> "application/octet-stream"
        }
    }
}
