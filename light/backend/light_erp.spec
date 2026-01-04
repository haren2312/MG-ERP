# -*- mode: python ; coding: utf-8 -*-
"""
PyInstaller spec file for Light ERP Module
Creates a standalone executable with all dependencies
"""
import os
import sys
from pathlib import Path
from PyInstaller.utils.hooks import collect_data_files, collect_submodules

block_cipher = None

# Collect escpos data files (including capabilities.json)
escpos_datas = collect_data_files('escpos', include_py_files=False)

# Manually add escpos capabilities directory if not collected
try:
    import escpos
    escpos_path = Path(escpos.__file__).parent
    capabilities_dir = escpos_path / 'capabilities'
    if capabilities_dir.exists():
        # Add all files from capabilities directory
        escpos_datas.append((str(capabilities_dir), 'escpos/capabilities'))
except Exception as e:
    print(f"Warning: Could not manually add escpos capabilities: {e}")

# Collect barcode font files
barcode_datas = collect_data_files('barcode')

# Collect all escpos submodules
escpos_hidden = collect_submodules('escpos')

a = Analysis(
    ['main.py'],
    pathex=[],
    binaries=[],
    datas=[
        ('models.py', '.'),
        ('schemas.py', '.'),
        ('routes.py', '.'),
        ('config.py', '.'),
        ('database.py', '.'),
        ('add_sample_data.py', '.'),
        ('escpos_capabilities', 'escpos/capabilities'),  # Manual escpos capabilities folder
    ] + escpos_datas + barcode_datas,
    hiddenimports=[
        'uvicorn.logging',
        'uvicorn.loops',
        'uvicorn.loops.auto',
        'uvicorn.protocols',
        'uvicorn.protocols.http',
        'uvicorn.protocols.http.auto',
        'uvicorn.protocols.websockets',
        'uvicorn.protocols.websockets.auto',
        'uvicorn.lifespan',
        'uvicorn.lifespan.on',
        'sqlalchemy.ext.declarative',
        'sqlalchemy.sql.default_comparator',
        'pkg_resources.py2_warn',
        'jaraco.text',
        'jaraco.functools',
        'importlib_resources',
        'platformdirs',
        'setuptools',
        'passlib.handlers',
        'passlib.handlers.bcrypt',
        'passlib.handlers.sha2_crypt',
        'barcode.codex',
        'barcode.ean',
        'barcode.code128',
    ] + escpos_hidden,
    hookspath=['.',],  # Look for hooks in current directory
    hooksconfig={},
    runtime_hooks=[],
    excludes=[],
    win_no_prefer_redirects=False,
    win_private_assemblies=False,
    cipher=block_cipher,
    noarchive=False,
)

pyz = PYZ(a.pure, a.zipped_data, cipher=block_cipher)

exe = EXE(
    pyz,
    a.scripts,
    a.binaries,
    a.zipfiles,
    a.datas,
    [],
    name='LightERP',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=False,
    upx_exclude=[],
    runtime_tmpdir=None,
    console=True,  # Set to False to hide console window
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
    icon=None  # Add icon file path here if you have one
)
