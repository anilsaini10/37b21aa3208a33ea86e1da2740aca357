package com.arise.geolocation

import android.annotation.SuppressLint
import android.location.Location
import android.location.LocationListener
import android.location.LocationManager
import android.os.Bundle
import android.os.Looper
import com.facebook.react.bridge.*

class GeolocationModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName() = "AriseGeolocation"

    @SuppressLint("MissingPermission")
    @ReactMethod
    fun getCurrentPosition(
        enableHighAccuracy: Boolean,
        timeout: Double,
        maximumAge: Double,
        promise: Promise,
    ) {
        val manager =
            reactContext.getSystemService(android.content.Context.LOCATION_SERVICE) as? LocationManager
        if (manager == null) {
            promise.reject("LOCATION_UNAVAILABLE", "LocationManager not available")
            return
        }

        val provider =
            if (enableHighAccuracy) LocationManager.GPS_PROVIDER else LocationManager.NETWORK_PROVIDER

        if (!manager.isProviderEnabled(provider) && !manager.isProviderEnabled(LocationManager.NETWORK_PROVIDER)) {
            promise.reject("POSITION_UNAVAILABLE", "No location provider enabled")
            return
        }

        val maxAgeMs = maximumAge.toLong()
        val last = manager.getLastKnownLocation(provider)
            ?: manager.getLastKnownLocation(LocationManager.NETWORK_PROVIDER)
        if (last != null && maxAgeMs > 0) {
            val age = System.currentTimeMillis() - last.time
            if (age <= maxAgeMs) {
                promise.resolve(locationToMap(last))
                return
            }
        }

        val timeoutMs = timeout.toLong()
        val resolved = java.util.concurrent.atomic.AtomicBoolean(false)

        val activeProvider =
            if (manager.isProviderEnabled(provider)) provider else LocationManager.NETWORK_PROVIDER

        val listener = object : LocationListener {
            override fun onLocationChanged(location: Location) {
                if (resolved.compareAndSet(false, true)) {
                    manager.removeUpdates(this)
                    promise.resolve(locationToMap(location))
                }
            }

            override fun onStatusChanged(p: String?, status: Int, extras: Bundle?) {}
            override fun onProviderEnabled(p: String) {}
            override fun onProviderDisabled(p: String) {}
        }

        try {
            manager.requestLocationUpdates(activeProvider, 0L, 0f, listener, Looper.getMainLooper())
        } catch (e: Exception) {
            if (resolved.compareAndSet(false, true)) {
                promise.reject("POSITION_UNAVAILABLE", e.message)
            }
            return
        }

        android.os.Handler(Looper.getMainLooper()).postDelayed({
            if (resolved.compareAndSet(false, true)) {
                manager.removeUpdates(listener)
                promise.reject("TIMEOUT", "Location request timed out")
            }
        }, timeoutMs)
    }

    private fun locationToMap(location: Location): WritableMap {
        val coords = Arguments.createMap().apply {
            putDouble("latitude", location.latitude)
            putDouble("longitude", location.longitude)
            putDouble("altitude", location.altitude)
            putDouble("accuracy", location.accuracy.toDouble())
            putDouble("speed", location.speed.toDouble())
            putDouble("heading", location.bearing.toDouble())
        }
        return Arguments.createMap().apply {
            putMap("coords", coords)
            putDouble("timestamp", location.time.toDouble())
        }
    }
}
