<?php
$jsUrl = 'https://cdn.jsdelivr.net/npm/sweetalert2@11';
$cssUrl = 'https://cdn.jsdelivr.net/npm/sweetalert2@11/dist/sweetalert2.min.css';

$localJsDir = __DIR__ . '/public/assets/local/js';
$localCssDir = __DIR__ . '/public/assets/local/css';
$localJsFile = $localJsDir . '/sweetalert2.min.js';
$localCssFile = $localCssDir . '/sweetalert2.min.css';

if (!is_dir($localJsDir)) {
    mkdir($localJsDir, 0755, true);
}

if (!is_dir($localCssDir)) {
    mkdir($localCssDir, 0755, true);
}

function downloadFile($url, $destination, $maxRetries = 3) {
    $attempt = 0;
    
    while ($attempt < $maxRetries) {
        $attempt++;
        
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 30);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
        
        $data = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error = curl_error($ch);
        curl_close($ch);
        
        if ($data !== false && $httpCode >= 200 && $httpCode < 300) {
            $bytesWritten = file_put_contents($destination, $data);
            if ($bytesWritten !== false && $bytesWritten > 0) {
                echo "Downloaded: " . basename($destination) . " (" . $bytesWritten . " bytes)\n";
                return true;
            }
            echo "Attempt " . $attempt . " failed: Unable to write file " . $destination . "\n";
        } else {
            echo "Attempt " . $attempt . " failed for " . basename($destination) . ": ";
            if ($error) {
                echo $error . "\n";
            } else {
                echo "HTTP " . $httpCode . "\n";
            }
        }
        
        if ($attempt < $maxRetries) {
            $delay = $attempt * 2;
            echo "Retrying in " . $delay . " seconds...\n";
            sleep($delay);
        }
    }
    
    return false;
}

echo "Downloading SweetAlert2...\n";

$jsSuccess = downloadFile($jsUrl, $localJsFile);
$cssSuccess = downloadFile($cssUrl, $localCssFile);

if ($jsSuccess && $cssSuccess) {
    echo "SweetAlert2 downloaded successfully.\n";
    exit(0);
} else {
    echo "Failed to download SweetAlert2 after 3 attempts.\n";
    if (!$jsSuccess) {
        echo "JS download failed.\n";
    }
    if (!$cssSuccess) {
        echo "CSS download failed.\n";
    }
    exit(1);
}