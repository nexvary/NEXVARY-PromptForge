package com.nexvary.promptforge;
import android.app.Activity;
import android.os.Bundle;
import android.os.Build;
import android.content.Intent;
import android.graphics.Color;
import android.net.Uri;
import android.webkit.*;
import android.view.ViewGroup;
import android.view.WindowManager;
import java.io.InputStream;
import java.util.Locale;
import android.content.res.AssetManager;

public final class MainActivity extends Activity {
    private WebView web;
    private static final String HOME="https://appassets.androidplatform.net/assets/index.html";
    private static final String ORIGIN="appassets.androidplatform.net";
    @Override public void onCreate(Bundle state) {
        super.onCreate(state);
        getWindow().setStatusBarColor(Color.rgb(9,16,29));
        getWindow().setNavigationBarColor(Color.rgb(9,16,29));
        web=new WebView(this);
        web.setLayoutParams(new ViewGroup.LayoutParams(-1,-1));
        setContentView(web);
        WebSettings settings=web.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setAllowFileAccess(false);
        settings.setAllowContentAccess(false);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        if(Build.VERSION.SDK_INT>=26)settings.setSafeBrowsingEnabled(true);
        WebView.setWebContentsDebuggingEnabled(false);
        web.setWebViewClient(new WebViewClient(){
            @Override public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request){
                Uri uri=request.getUrl();
                if("https".equals(uri.getScheme()) && ORIGIN.equals(uri.getHost()))return false;
                if("https".equals(uri.getScheme())&&"github.com".equals(uri.getHost())){
                    startActivity(new Intent(Intent.ACTION_VIEW,uri));return true;
                }
                return true;
            }
            @Override public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request){
                Uri uri=request.getUrl();
                if(!"https".equals(uri.getScheme()) || !ORIGIN.equals(uri.getHost()))return null;
                String path=uri.getPath();
                if(path==null||!path.startsWith("/assets/"))return blocked();
                String name=path.substring(8);
                if(name.isEmpty())name="index.html";
                if(name.contains("..")||name.startsWith("/")||name.contains("\\"))return blocked();
                String mime="text/plain";
                if(name.endsWith(".html"))mime="text/html";
                else if(name.endsWith(".js")||name.endsWith(".mjs"))mime="text/javascript";
                else if(name.endsWith(".css"))mime="text/css";
                else if(name.endsWith(".json")||name.endsWith(".webmanifest"))mime="application/json";
                else if(name.endsWith(".svg"))mime="image/svg+xml";
                try {
                    InputStream stream=getAssets().open(name,AssetManager.ACCESS_STREAMING);
                    WebResourceResponse response=new WebResourceResponse(mime,"UTF-8",stream);
                    response.setResponseHeaders(java.util.Collections.singletonMap("Access-Control-Allow-Origin","*"));
                    return response;
                } catch (Exception exception){return new WebResourceResponse("text/plain","UTF-8",404,"Not found",java.util.Collections.emptyMap(),new java.io.ByteArrayInputStream(new byte[0]));}
            }
            private WebResourceResponse blocked(){
                return new WebResourceResponse("text/plain","UTF-8",403,"Forbidden",java.util.Collections.emptyMap(),new java.io.ByteArrayInputStream(new byte[0]));
            }
        });
        web.loadUrl(HOME);
    }
    @Override public void onBackPressed(){
        if(web!=null)web.evaluateJavascript("window.promptforgeBack ? window.promptforgeBack() : history.back()",null);
        else super.onBackPressed();
    }
    @Override protected void onDestroy(){
        if(web!=null){web.destroy();web=null;}
        super.onDestroy();
    }
}
