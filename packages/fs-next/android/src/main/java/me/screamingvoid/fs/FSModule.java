package me.screamingvoid.fs;

import android.content.ContentResolver;
import android.content.Context;
import android.net.Uri;
import android.os.ParcelFileDescriptor;
import android.util.Log;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.facebook.react.bridge.JavaScriptContextHolder;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.module.annotations.ReactModule;

import java.io.FileNotFoundException;

@ReactModule(name = FSModule.NAME)
public class FSModule extends ReactContextBaseJavaModule {
  public static final String NAME = "FS";

  public FSModule(ReactApplicationContext reactContext) {
    super(reactContext);
  }

  @NonNull
  @Override
  public String getName() {
    return NAME;
  }

  @ReactMethod(isBlockingSynchronousMethod = true)
  public boolean install() {
    try {
      Log.i(NAME, "Loading C++ library...");
      System.loadLibrary("fs");

      JavaScriptContextHolder jsContext = getReactApplicationContext().getJavaScriptContextHolder();

      Log.i(NAME, "Installing JSI Bindings for @screamingvoid/fs...");
      nativeInstall(jsContext.get(), this);
      Log.i(NAME, "Successfully installed JSI Bindings for @screamingvoid/fs!");

      return true;
    } catch (Exception exception) {
      Log.e(NAME, "Failed to install JSI Bindings for @screamingvoid/fs!", exception);
      return false;
    }
  }

  public int getFileDescriptor(final String uri, final String mode) {
    Context ctx = getReactApplicationContext();
    ContentResolver resolver = ctx.getContentResolver();
    try {
      ParcelFileDescriptor fd = resolver.openFileDescriptor(Uri.parse(uri), mode);
      return fd.detachFd();
    } catch (FileNotFoundException exc) {
      return -1;
    }
  }

  private static native void nativeInstall(long jsiPtr, Object thiz);
}
