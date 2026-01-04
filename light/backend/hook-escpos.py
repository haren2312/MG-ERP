# PyInstaller runtime hook for escpos
# Ensures capabilities.json is found in the frozen bundle

from PyInstaller.utils.hooks import collect_data_files, collect_submodules

# Collect all escpos data files
datas = collect_data_files('escpos', include_py_files=False)

# Collect all escpos submodules
hiddenimports = collect_submodules('escpos')
