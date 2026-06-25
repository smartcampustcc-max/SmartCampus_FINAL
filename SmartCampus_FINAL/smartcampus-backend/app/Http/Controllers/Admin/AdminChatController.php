<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminChatController extends Controller
{
    public function index(Request $request)
    {
        $conversas = DB::table('mensagemchats')
            ->join('salas_de_aula', 'mensagemchats.turma_id', '=', 'salas_de_aula.id')
            ->join('disciplinas', 'mensagemchats.disciplina_id', '=', 'disciplinas.id')
            ->leftJoin('atribuicoes', function ($join) {
                $join->on('mensagemchats.turma_id', '=', 'atribuicoes.turma_id')
                    ->on('mensagemchats.disciplina_id', '=', 'atribuicoes.disciplina_id');
            })
            ->leftJoin('users as professores', 'atribuicoes.professor_id', '=', 'professores.id')
            ->select(
                'mensagemchats.turma_id',
                'mensagemchats.disciplina_id',
                'salas_de_aula.nome as turma',
                'disciplinas.nome as disciplina',
                DB::raw('COALESCE(professores.name, "Sem professor") as professor'),
                DB::raw('COUNT(mensagemchats.id) as total_mensagens'),
                DB::raw('MAX(mensagemchats.created_at) as ultima_mensagem')
            )
            ->groupBy(
                'mensagemchats.turma_id',
                'mensagemchats.disciplina_id',
                'salas_de_aula.nome',
                'disciplinas.nome',
                'professores.name'
            )
            ->orderByDesc('ultima_mensagem')
            ->get();

        return response()->json($conversas);
    }

    public function show($turmaId, $disciplinaId)
    {
        $mensagens = DB::table('mensagemchats')
            ->join('users', 'mensagemchats.remetente_id', '=', 'users.id')
            ->where('mensagemchats.turma_id', $turmaId)
            ->where('mensagemchats.disciplina_id', $disciplinaId)
            ->select(
                'mensagemchats.*',
                'users.name as utilizador',
                'users.role'
            )
            ->orderBy('mensagemchats.created_at')
            ->get();

        return response()->json($mensagens);
    }
}