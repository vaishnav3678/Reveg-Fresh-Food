import zipfile, os, sys
dist_dir = sys.argv[1]
output_zip = sys.argv[2]
if os.path.exists(output_zip):
    os.remove(output_zip)
with zipfile.ZipFile(output_zip, 'w', zipfile.ZIP_DEFLATED) as zipf:
    for root, dirs, files in os.walk(dist_dir):
        for file in files:
            if file == '.DS_Store' or file.endswith('.map') or file == os.path.basename(output_zip):
                continue
            file_path = os.path.join(root, file)
            arcname = os.path.relpath(file_path, dist_dir)
            zipf.write(file_path, arcname)
print(f"Archive written successfully to {output_zip}")
