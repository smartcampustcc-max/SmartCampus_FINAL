<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\SuporteController;

/* ================= SUPERADMIN ================= */
use App\Http\Controllers\SuperAdmin\EscolaController;
use App\Http\Controllers\SuperAdmin\AdministradoresController;

/* ================= ADMIN ESCOLA ================= */
use App\Http\Controllers\Admin\SalaDeAulaController;
use App\Http\Controllers\Admin\DisciplinaController;
use App\Http\Controllers\Admin\CursoController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\ProfessorController;
use App\Http\Controllers\Admin\AtribuicaoController;
use App\Http\Controllers\Admin\EstudanteController;
use App\Http\Controllers\Admin\AvisoController;
use App\Http\Controllers\Admin\HorarioController;
use App\Http\Controllers\Admin\AdminChatController;

/* ================= PROFESSOR ================= */
use App\Http\Controllers\Professor\PainelController;
use App\Http\Controllers\Professor\MateriaisController as ProfessorMateriaisController;

/* ================= ALUNO ================= */
use App\Http\Controllers\Estudante\PerfilController;
use App\Http\Controllers\Estudante\MateriaisController as EstudanteMateriaisController;
Use App\Http\Controllers\ChatController;

/*
|--------------------------------------------------------------------------
| ROTAS PÚBLICAS
|--------------------------------------------------------------------------
*/

Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/set-password', [AuthController::class, 'setPassword']);
Route::post('/auth/recuperar-password', [AuthController::class, 'recuperarPassword']);

/*
|--------------------------------------------------------------------------
| ROTAS PROTEGIDAS
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->group(function () {

    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::post('/auth/change-password', [AuthController::class, 'changePassword']);
    Route::post('/auth/change-password', [AuthController::class, 'firstChangePassword']);

    /*
    |--------------------------------------------------------------------------
    | SUPORTE - ALUNO / PROFESSOR
    |--------------------------------------------------------------------------
    */

    Route::middleware('role:estudante,professor')
        ->post('/suporte', [SuporteController::class, 'store']);

    /*
    |--------------------------------------------------------------------------
    | TESTES POR ROLE
    |--------------------------------------------------------------------------
    */

    Route::middleware('role:superadmin')->get('/superadmin/teste', fn () =>
        response()->json(['area' => 'superadmin'])
    );

    Route::middleware('role:admin_escola,admin')->get('/admin/teste', fn () =>
        response()->json(['area' => 'admin_escola'])
    );

    Route::middleware('role:estudante')->get('/estudante/teste', fn () =>
        response()->json(['area' => 'estudante'])
    );

    Route::middleware('role:professor')->get('/professor/teste', fn () =>
        response()->json(['area' => 'professor'])
    );

    /*
    |--------------------------------------------------------------------------
    | SUPERADMIN
    |--------------------------------------------------------------------------
    */

    Route::middleware('role:superadmin')->prefix('superadmin')->group(function () {
        Route::apiResource('escolas', EscolaController::class);
        Route::post('escolas/{id}/enviar-credenciais', [EscolaController::class, 'enviarCredenciais']);
        Route::get('estatisticas', [EscolaController::class, 'estatisticas']);

        Route::get('administradores', [AdministradoresController::class, 'index']);
        Route::post('administradores/{id}/reenviar', [AdministradoresController::class, 'reenviar']);
        Route::post('avisos', [EscolaController::class, 'enviarAvisoGeral']);
    });

    /*
    |--------------------------------------------------------------------------
    | ADMIN DA ESCOLA
    |--------------------------------------------------------------------------
    */

    Route::middleware('role:admin_escola,admin')->prefix('admin')->group(function () {

        Route::get('dashboard', [DashboardController::class, 'index']);

        Route::get('horarios', [HorarioController::class, 'index']);
        Route::post('horarios', [HorarioController::class, 'store']);
        Route::delete('horarios/{id}', [HorarioController::class, 'destroy']);
        Route::put('horarios/{id}', [HorarioController::class, 'update']);

        Route::apiResource('professores', ProfessorController::class);
        Route::post('professores/{id}/enviar-credenciais', [ProfessorController::class, 'enviarCredenciais']);
        Route::apiResource('estudantes', EstudanteController::class);
        Route::apiResource('turmas', SalaDeAulaController::class);
        Route::apiResource('disciplinas', DisciplinaController::class);

        Route::get('cursos/{id}/disciplinas', [CursoController::class, 'disciplinas']);
        Route::post('cursos/{id}/disciplinas', [CursoController::class, 'syncDisciplinas']);
        Route::get('cursos', [CursoController::class, 'index']);
        Route::post('cursos', [CursoController::class, 'store']);
        Route::put('cursos/{id}', [CursoController::class, 'update']);
        Route::delete('cursos/{id}', [CursoController::class, 'destroy']);

        Route::get('avisos', [AvisoController::class, 'index']);
        Route::post('avisos', [AvisoController::class, 'store']);
        Route::delete('avisos/{id}', [AvisoController::class, 'destroy']);
        Route::get('turmas/{id}/disciplinas', [SalaDeAulaController::class, 'disciplinas']);
        Route::post('turmas/{id}/disciplinas', [SalaDeAulaController::class, 'syncDisciplinas']);

        Route::get('atribuicoes', [AtribuicaoController::class, 'index']);
        Route::post('atribuicoes', [AtribuicaoController::class, 'store']);
        Route::get('atribuicoes/{id}', [AtribuicaoController::class, 'show']);
        Route::delete('atribuicoes/{id}', [AtribuicaoController::class, 'destroy']);

        Route::get('turmas/{turmaId}/atribuicoes', [AtribuicaoController::class, 'byTurma']);
        Route::get('professores/{professorId}/atribuicoes', [AtribuicaoController::class, 'byProfessor']);

       // Route::get('turmas/{turma}/alunos', [TurmaAlunosController::class, 'index']);
        Route::get('turmas/{id}/alunos-elegiveis', [SalaDeAulaController::class, 'alunosElegiveis']);
        Route::post('turmas/{id}/preencher-automatico', [SalaDeAulaController::class, 'preencherAutomatico']);
        Route::post('turmas/{id}/adicionar-alunos', [SalaDeAulaController::class, 'adicionarAlunos']);
        Route::delete('turmas/{turmasId}/alunos/{alunoId}', [SalaDeAulaController::class, 'removerAluno']);

        Route::get('suportes', [SuporteController::class, 'index']);
        Route::put('suportes/{id}', [SuporteController::class, 'responder']);

        
        Route::get('chats', [AdminChatController::class, 'index']);
        Route::get('chats/{turmaId}/{disciplinaId}', [AdminChatController::class, 'show']);
       
    });

    /*
    |--------------------------------------------------------------------------
    | PROFESSOR
    |--------------------------------------------------------------------------
    */

    Route::middleware('role:professor')->prefix('professor')->group(function () {
        Route::get('minhas-atribuicoes', [PainelController::class, 'minhasAtribuicoes']);
          Route::get('notas', [PainelController::class, 'notas']);
        Route::post('notas', [PainelController::class, 'guardarNotas']);
        Route::get('notas/historico', [PainelController::class, 'historicoNotas']);
        Route::get('notas/detalhes', [PainelController::class, 'detalhesNotas']);
        Route::post('meus-lembretes', [PainelController::class, 'storeMeuLembrete']);
        Route::delete('meus-lembretes/{id}', [PainelController::class, 'destroyMeuLembrete']);
        Route::post('eventos', [PainelController::class, 'storeEvento']);

        Route::delete('eventos/{id}', [PainelController::class, 'destroyEvento']);
        Route::get('turmas/{turmaId}/alunos', [PainelController::class, 'alunosDaTurma']);
        Route::post('faltas', [PainelController::class, 'marcarFalta']);
        Route::delete('faltas/{id}', [PainelController::class, 'removerFalta']);
         Route::put('faltas/{id}/justificar', [PainelController::class, 'justificarFalta']);
        Route::get('alunos/{estudanteId}/faltas', [PainelController::class, 'historicoFaltas']);
        Route::get('chat/mensagens', [ChatController::class, 'index']);
        Route::post('chat/mensagens', [ChatController::class, 'store']);
        Route::get('notificacoes', [PainelController::class, 'notificacoes']);


        Route::get('materiais', [ProfessorMateriaisController::class, 'index']);
        Route::post('materiais', [ProfessorMateriaisController::class, 'store']);
        Route::delete('materiais/{id}', [ProfessorMateriaisController::class, 'destroy']);
        Route::get('materiais/{id}/visualizacoes', [ProfessorMateriaisController::class, 'visualizacoes']);

        Route::get('avisos', [PainelController::class, 'avisos']);
      
    });

    /*
    |--------------------------------------------------------------------------
    | ESTUDANTE
    |--------------------------------------------------------------------------
    */

    Route::middleware('role:estudante')->prefix('estudante')->group(function () {
        Route::get('perfil', [PerfilController::class, 'perfil']);
            Route::get('notas', [PerfilController::class, 'notas']);
            Route::get('faltas', [PerfilController::class, 'minhasfaltas']);   

        Route::get('materiais', [EstudanteMateriaisController::class, 'index']);
        Route::get('notas', [PerfilController::class, 'notas']);
        Route::post('materiais/{id}/abrir', [EstudanteMateriaisController::class, 'abrir']);
            Route::get('chat/mensagens', [ChatController::class, 'index']);
        Route::post('chat/mensagens', [ChatController::class, 'store']);
        Route::get('disciplinas', [PerfilController::class, 'disciplinas']);
        Route::get('notificacoes', [PerfilController::class, 'notificacoes']);
        Route::get('horarios', [PerfilController::class, 'horarios']);

        Route::get('avisos', [PerfilController::class, 'avisos']);
    });
});