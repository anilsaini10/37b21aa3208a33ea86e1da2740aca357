package com.arise

import android.app.Application
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactHost
import com.facebook.react.ReactNativeApplicationEntryPoint.loadReactNative
import com.facebook.react.defaults.DefaultReactHost.getDefaultReactHost

import com.arise.imagePicker.ImagePickerPackage
import com.arise.crashHandler.CrashHandlerPackage
import com.arise.cacheManager.CacheManagerPackage
import com.arise.networkMonitor.NetworkMonitorPackage
import com.arise.geolocation.GeolocationPackage
import com.arise.share.SharePackage

class MainApplication : Application(), ReactApplication {

  override val reactHost: ReactHost by lazy {
    getDefaultReactHost(
      context = applicationContext,
      packageList =
        PackageList(this).packages.apply {
          // Packages that cannot be autolinked yet can be added manually here, for example:
          // add(MyReactNativePackage())

          add(ImagePickerPackage())
          add(CrashHandlerPackage())
          add(CacheManagerPackage())
          add(NetworkMonitorPackage())
          add(GeolocationPackage())
          add(SharePackage())
        },
    )
  }

  override fun onCreate() {
    super.onCreate()
    loadReactNative(this)
  }
}
