<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;
use App\Imports\TurmasImport;

class ImportController extends Controller
{
    public function importTurmas(Request $request)
    {
        $request->validate([
            'file' => ['required', 'file', 'mimes:xlsx,xls'],
        ]);

        $import = new TurmasImport();

        Excel::import($import, $request->file('file'));

        return response()->json([
            'message' => 'Importação concluída!',
            'importadas' => $import->importadas,
            'atualizadas' => $import->atualizadas,
            'erros' => $import->erros,
        ]);
    }
}
