<?php

namespace App\Jobs;

use App\Models\Estudante;
use App\Services\SmsService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class SendWelcomeSms implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;

    protected int $alunoId;

    public function __construct(int $alunoId)
    {
        $this->alunoId = $alunoId;
    }

    public function handle(SmsService $sms): void
    {
        $aluno = Estudante::find($this->alunoId);

        if (!$aluno || empty($aluno->telefone)) {
            return;
        }

        $mensagem = "Olá, {$aluno->nome_completo}! A sua matrícula foi registada com sucesso. Bem-vindo(a)!";

        $sms->send($aluno->telefone, $mensagem);
    }
}