// Pega o caminho atual da página, tipo: "/index.html"
const pagina = window.location.pathname;

// Vai verifica se o usuário está na página "index.html"
if (pagina.includes("index.html")) {

    // Pega o botão de iniciar pelo ID
    const btnIniciar = document.getElementById("Iniciar");

    // Quando clicarem no botão iniciar:
    btnIniciar.addEventListener("click", () => {
        // Pega o valor digitado no input de nome
        const nome = document.getElementById("nome-jogador").value;

        // Salva o nome do jogador no localStorage (para que consiga usar em outras páginas)
        localStorage.setItem("nomeJogador", nome);

        // Redireciona o jogador para a página do jogo
        window.location.href = "/Estrutura-Jogo/Jogo.html";
    });

    // Botão "Reiniciar" para apagar os dados salvos e limpar a tela
    const btnReninciar = document.getElementById('btn-reninciar');

    btnReninciar.addEventListener('click', () => {
        // Quando clicar no botão Remove os dados salvos do localStorage
        localStorage.removeItem("ranking");         // Zera o ranking
        localStorage.removeItem("nomeJogador");     // Remove o nome do jogador
        localStorage.removeItem("pontuacaoAtual");  // Zera a pontuação

        // Limpa a tabela de ranking da tela (caso ela exista)
        const rankingTable = document.querySelector(".ranking-section tbody");
        if (rankingTable) {
            rankingTable.innerHTML = "";
        }

        // Reseta o nome e a pontuação exibidos no topo da tela
        document.getElementById("nome-jogador-header").textContent = "Jogador:";
        document.getElementById("pontuacao-header").textContent = "Pontuação: 0";
    });

    // Pega o nome e pontuação atuais do jogador no localStorage
    const nomeAtual = localStorage.getItem("nomeJogador") || "Jogador";
    const pontuacaoAtual = localStorage.getItem("pontuacaoAtual") || 0;

    // Mostra essas infos no cabeçalho (topo da tela)
    document.getElementById("nome-jogador-header").textContent = `Jogador: ${nomeAtual}`;
    document.getElementById("pontuacao-header").textContent = `Pontuação: R$ ${Number(pontuacaoAtual).toLocaleString('pt-BR')}`;

    // Carrega o ranking salvo no localStorage (ou usa lista vazia se não tiver nada)
    const ranking = JSON.parse(localStorage.getItem("ranking")) || [];

    // Pega o corpo da tabela de ranking
    const rankingTable = document.querySelector(".ranking-section tbody");

    if (rankingTable) {
        rankingTable.innerHTML = ""; // Limpa o conteúdo anterior

        // Para cada item no ranking, cria uma linha com posição, nome e pontuação
        ranking.forEach((item, i) => {
            const tr = document.createElement("tr");
            tr.innerHTML = `<td>${i + 1}</td><td>${item.nome}</td><td>${item.pontuacao.toLocaleString('pt-BR')}</td>`;
            rankingTable.appendChild(tr); // Adiciona a linha na tabela
        });
    }

    // Lida com o botão de ajuda (abre e fecha o modal explicativo)

    // Pega o botão de ajuda, o modal, e o botão de fechar
    const btnAjuda = document.getElementById('btn-ajuda');
    const modalAjuda = document.getElementById('modal-ajuda');
    const fecharAjuda = document.getElementById('fechar-ajuda');

    // Quando clicar no botão de ajuda, mostra o modal (display flex)
    btnAjuda.addEventListener('click', () => {
        modalAjuda.style.display = 'flex';
    });

    // Quando clicar em "Fechar", esconde o modal
    fecharAjuda.addEventListener('click', () => {
        modalAjuda.style.display = 'none';
    });
}



// Verifica se está na página do jogo (Jogo.html)
if (pagina.includes("Jogo.html")) {

    // Recupera o nome salvo no localStorage
    const nomeSalvo = localStorage.getItem("nomeJogador");

    // Se tiver nome salvo, mostra no cabeçalho
    if (nomeSalvo) {
        const nomeHeader = document.getElementById("nome-jogador-header");
        nomeHeader.textContent = `Jogador: ${nomeSalvo}`;
    }

    // Seleciona todas as divs de perguntas
    let perguntas = document.querySelectorAll(".pergunta");

    // Variáveis de controle do jogo
    let perguntaAtual = 0;
    let acertos = 0;
    let respostaSelecionada = null;
    let tempoRestante = 30;
    let intervaloTempo;

    // Seleciona elementos importantes da tela
    const btnProxima = document.getElementById("btnProxima");
    const resultado = document.getElementById("resultado");
    const temporizador = document.getElementById("temporizador");

    // Lista com os valores das premiações por pergunta
    const premiacoes = [
        1000, 2000, 5000, 10000, 20000, 50000, 100000, 200000, 500000, 1000000
    ];

    // Botões de ajuda e controle
    const btnPular = document.getElementById("btn-pular");
    const btnEliminar = document.getElementById("Btn-eliminar");
    const btnEncerrar = document.getElementById("btn-encerrar");

    // Se o jogador clicar em "Encerrar"
    btnEncerrar.addEventListener("click", () => {
        const valorAtual = acertos > 0 ? premiacoes[acertos - 1] : 0;
        localStorage.setItem("pontuacaoAtual", valorAtual);

        const nomeJogador = localStorage.getItem("nomeJogador") || "Jogador";
        let ranking = JSON.parse(localStorage.getItem("ranking")) || [];
        ranking.push({ nome: nomeJogador, pontuacao: valorAtual });
        ranking.sort((a, b) => b.pontuacao - a.pontuacao);
        ranking = ranking.slice(0, 10);
        localStorage.setItem("ranking", JSON.stringify(ranking));

        // Vai para a tela inicial
        window.location.href = "/Estrutura-Jogo/index.html";
    });

    // Função para pular pergunta
    btnPular.addEventListener("click", pularPergunta);
    function pularPergunta() {
        clearInterval(intervaloTempo); // parar o tempo
        proximaPergunta(); // ir para a próxima pergunta
        btnPular.disabled = true; // desabilita o botão após o uso
    }
    

    // Função para eliminar duas alternativas erradas
    btnEliminar.addEventListener("click", eliminarErradas);
    function eliminarErradas() {
        const perguntaAtualDiv = perguntas[perguntaAtual];
        const botoes = perguntaAtualDiv.querySelectorAll("button");
        let correta = null;

        let erradas = [];
        botoes.forEach((botao, index) => {
            if (botao.dataset.correta === "true") {
                correta = index;
            } else {
                erradas.push(index);
            }
        });
        const erradasParaEliminar = erradas.sort(() => Math.random() - 0.5).slice(0, 2);
        erradasParaEliminar.forEach(index => {
            botoes[index].style.display = "none"; // esconder botões errados
        });
        btnEliminar.disabled = true; // desabilitar botão de eliminar
    }

    // Função chamada ao clicar numa resposta
    function selecionar(botaoClicado) {
        clearInterval(intervaloTempo); // parar o tempo
        btnProxima.style.display = "block";

        const perguntaAtualDiv = perguntas[perguntaAtual];
        const botoes = perguntaAtualDiv.querySelectorAll("button");

        botoes.forEach(botao => {
            botao.disabled = true; // desabilita clique depois de escolher

            if (botao.dataset.correta === "true") {
                botao.classList.add("correta");
            }
        });

        // Verifica se a resposta foi correta
        respostaSelecionada = botaoClicado.dataset.correta === "true";
        if (respostaSelecionada) {
            botaoClicado.classList.add("correta");
        } else {
            botaoClicado.classList.add("errada");
        }
    }

    // Avança para a próxima pergunta
    function proximaPergunta() {
        resultado.style.display = "none"; // esconder resultado

        if (respostaSelecionada) {
            acertos++;
            document.getElementById("pontuacao-header").textContent = `Pontuação: R$ ${premiacoes[acertos - 1].toLocaleString('pt-BR')}`;
        }

        perguntas[perguntaAtual].classList.remove("ativa");
        perguntaAtual++;
        respostaSelecionada = null;
        btnProxima.style.display = "none";

        if (perguntaAtual < perguntas.length) {
            perguntas[perguntaAtual].classList.add("ativa");
            iniciarTemporizador(); // reiniciar o temporizador para a próxima pergunta
        } else {
            mostrarResultado(); // se acabou as perguntas
        }
    }

    // Mostra o resultado final do jogo
    function mostrarResultado() {
        let valorFinal = acertos > 0 ? premiacoes[acertos - 1] : 0;
        resultado.innerHTML = `
        Você acertou ${acertos} de ${perguntas.length} perguntas!<br>
        Sua premiação: R$ ${valorFinal.toLocaleString('pt-BR')} reais.`;
        resultado.style.display = "block";
        temporizador.style.display = "none"; // esconder temporizador
        localStorage.setItem("pontuacaoAtual", valorFinal);
        document.getElementById("ajuda").style.display = "none"; // esconder ajuda

        // Salvar no ranking
        const nomeJogador = localStorage.getItem("nomeJogador") || "Jogador";
        let ranking = JSON.parse(localStorage.getItem("ranking")) || [];
        ranking.push({ nome: nomeJogador, pontuacao: valorFinal });
        ranking.sort((a, b) => b.pontuacao - a.pontuacao);
        ranking = ranking.slice(0, 10);
        localStorage.setItem("ranking", JSON.stringify(ranking));

        // Mostrar botão de voltar
        const btnVoltar = document.getElementById("btnVoltar");
        btnVoltar.style.display = "block";
        btnVoltar.onclick = () => {
            window.location.href = "/Estrutura-Jogo/index.html";
        };
    }

    // Inicia o cronômetro da pergunta
    function iniciarTemporizador() {
        tempoRestante = 30;
        temporizador.textContent = `Tempo restante: ${tempoRestante}s`;

        intervaloTempo = setInterval(() => {
            tempoRestante--;
            temporizador.textContent = `Tempo restante: ${tempoRestante}s`;

            if (tempoRestante <= 0) {
                clearInterval(intervaloTempo);
                encerrarPorTempo();
            }
        }, 1000);
    }

    // Quando o tempo acaba sem resposta
    function encerrarPorTempo() {
        resultado.innerHTML = "Tempo esgotado! Você não respondeu a pergunta.";
        resultado.style.display = "block";
        perguntas[perguntaAtual].classList.remove("ativa");
        btnProxima.style.display = "none";
        clearInterval(intervaloTempo);

        // Vai para a próxima depois de 2 segundos
        setTimeout(() => {
            proximaPergunta();
        }, 2000);
    }

    iniciarTemporizador(); // inicia o tempo da primeira pergunta
}








