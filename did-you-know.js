// Comportamento comum às três versões da página "Você sabia?".
// Cada página define antes, no seu próprio idioma:
//   premios   – a lista dos prêmios (vira um cartão cada)
//   perguntas – o "Verdade ou mito?"
//   rotulos   – as palavras dos botões e das respostas

// O idioma desta página fica guardado, para a página inicial abrir nele
try {
  localStorage.setItem('idioma', document.documentElement.getAttribute('data-idioma'));
} catch (e) {}

// Monta os cartões em cada seção
premios.forEach(function (p) {
  var grade = document.querySelector('[data-nivel="' + p.nivel + '"]');
  var cartao = document.createElement('article');
  cartao.className = 'prize' + (p.brilha ? ' brilha' : '') + (p.largo ? ' largo' : '');
  cartao.innerHTML =
    '<div class="prize-top"><span class="num">' + p.n + '</span>' +
    '<span class="tag">' + p.onde + '</span></div>' +
    '<h3>' + p.nome + '</h3><p>' + p.texto + '</p>';
  grade.appendChild(cartao);
});

// Verdade ou mito: as perguntas e os rótulos vêm de cada página
var lista = document.getElementById('quiz-list');

perguntas.forEach(function (q) {
  var caixa = document.createElement('div');
  caixa.className = 'q';
  caixa.innerHTML =
    '<p>' + q.frase + '</p>' +
    '<div class="buttons"><button data-v="1">' + rotulos.verdade + '</button>' +
    '<button data-v="0">' + rotulos.mito + '</button></div>' +
    '<div class="answer"></div>';

  caixa.querySelectorAll('button').forEach(function (botao) {
    botao.addEventListener('click', function () {
      var palpite = botao.getAttribute('data-v') === '1';
      var acertou = palpite === q.verdade;
      botao.classList.add('escolhida');
      caixa.classList.add('respondida');
      caixa.querySelector('.answer').innerHTML =
        '<b class="' + (acertou ? 'certo' : 'errado') + '">' +
        (acertou ? rotulos.acertou : rotulos.quase) + '</b> ' +
        (q.verdade ? rotulos.eVerdade : rotulos.eMito) + ' ' + q.explica;
    });
  });

  lista.appendChild(caixa);
});

// O problema resolvido abre a história de Perelman
var botaoPoincare = document.getElementById('poincare');
botaoPoincare.addEventListener('click', function () {
  var aberta = document.getElementById('story').classList.toggle('aberta');
  botaoPoincare.setAttribute('aria-expanded', aberta);
});

// Os cartões aparecem suavemente quando chegam à tela,
// e os números contam até o valor final
var observador = new IntersectionObserver(function (itens) {
  itens.forEach(function (item) {
    if (!item.isIntersecting) return;
    var el = item.target;
    observador.unobserve(el);

    if (el.classList.contains('prize')) {
      el.classList.add('visivel');
      return;
    }

    var alvo = Number(el.getAttribute('data-conta'));
    var atual = 0;
    var passo = setInterval(function () {
      atual++;
      el.textContent = atual;
      if (atual >= alvo) clearInterval(passo);
    }, 900 / alvo);
  });
}, { threshold: .2 });

document.querySelectorAll('.prize, [data-conta]').forEach(function (el) {
  observador.observe(el);
});

// O menu dos degraus marca a seção que está na tela
var links = document.querySelectorAll('#steps-nav a');
var marcador = new IntersectionObserver(function (itens) {
  itens.forEach(function (item) {
    if (!item.isIntersecting) return;
    links.forEach(function (a) {
      a.classList.toggle('ativo', a.getAttribute('href') === '#' + item.target.id);
    });
  });
}, { rootMargin: '-45% 0px -50% 0px' });

links.forEach(function (a) {
  marcador.observe(document.querySelector(a.getAttribute('href')));
});
