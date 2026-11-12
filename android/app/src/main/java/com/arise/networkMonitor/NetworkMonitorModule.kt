package com.arise.networkMonitor

import android.content.Context
import android.net.ConnectivityManager
import android.net.Network
import android.net.NetworkCapabilities
import android.net.NetworkRequest
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule

class NetworkMonitorModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    private var listening = false
    private var networkCallback: ConnectivityManager.NetworkCallback? = null

    override fun getName() = "NetworkMonitor"

    private fun getConnectivityManager(): ConnectivityManager =
        reactContext.getSystemService(Context.CONNECTIVITY_SERVICE) as ConnectivityManager

    @ReactMethod
    fun isConnected(promise: Promise) {
        try {
            val cm = getConnectivityManager()
            val network = cm.activeNetwork
            if (network == null) {
                promise.resolve(false)
                return
            }
            val caps = cm.getNetworkCapabilities(network)
            val connected = caps != null &&
                (caps.hasTransport(NetworkCapabilities.TRANSPORT_WIFI) ||
                 caps.hasTransport(NetworkCapabilities.TRANSPORT_CELLULAR) ||
                 caps.hasTransport(NetworkCapabilities.TRANSPORT_ETHERNET))
            promise.resolve(connected)
        } catch (e: Exception) {
            promise.reject("NETWORK_ERROR", e.message)
        }
    }

    @ReactMethod
    fun getConnectionType(promise: Promise) {
        try {
            val cm = getConnectivityManager()
            val network = cm.activeNetwork
            val caps = cm.getNetworkCapabilities(network)
            val type = when {
                caps == null -> "none"
                caps.hasTransport(NetworkCapabilities.TRANSPORT_WIFI) -> "wifi"
                caps.hasTransport(NetworkCapabilities.TRANSPORT_CELLULAR) -> "cellular"
                caps.hasTransport(NetworkCapabilities.TRANSPORT_ETHERNET) -> "ethernet"
                else -> "unknown"
            }
            promise.resolve(type)
        } catch (e: Exception) {
            promise.reject("NETWORK_ERROR", e.message)
        }
    }

    @ReactMethod
    fun startListening(promise: Promise) {
        if (listening) {
            promise.resolve(true)
            return
        }
        try {
            val cm = getConnectivityManager()
            val request = NetworkRequest.Builder()
                .addCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET)
                .build()

            networkCallback = object : ConnectivityManager.NetworkCallback() {
                override fun onAvailable(network: Network) {
                    sendEvent(true)
                }

                override fun onLost(network: Network) {
                    sendEvent(false)
                }

                override fun onCapabilitiesChanged(network: Network, caps: NetworkCapabilities) {
                    val hasInternet = caps.hasCapability(NetworkCapabilities.NET_CAPABILITY_VALIDATED)
                    sendEvent(hasInternet)
                }
            }

            cm.registerNetworkCallback(request, networkCallback!!)
            listening = true
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("LISTEN_ERROR", e.message)
        }
    }

    @ReactMethod
    fun stopListening(promise: Promise) {
        try {
            if (listening && networkCallback != null) {
                val cm = getConnectivityManager()
                cm.unregisterNetworkCallback(networkCallback!!)
                networkCallback = null
                listening = false
            }
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("STOP_ERROR", e.message)
        }
    }

    @ReactMethod
    fun addListener(@Suppress("UNUSED_PARAMETER") eventName: String) {}

    @ReactMethod
    fun removeListeners(@Suppress("UNUSED_PARAMETER") count: Int) {}

    private fun sendEvent(isConnected: Boolean) {
        reactContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit("networkStatusChanged", isConnected)
    }
}
