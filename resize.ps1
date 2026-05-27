Add-Type -AssemblyName System.Drawing
$src = "d:\CODES\antigravity_projects\new project 2\icon_concept_2_1779368429590.png"
$img = [System.Drawing.Image]::FromFile($src)
$sizes = @(16, 48, 128)
foreach ($s in $sizes) {
    $bmp = New-Object System.Drawing.Bitmap($img, $s, $s)
    $dest = "d:\CODES\antigravity_projects\new project 2\icon$s.png"
    $bmp.Save($dest, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
}
$img.Dispose()
