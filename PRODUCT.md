# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Recrutadores, líderes técnicos e potenciais clientes de freelance que chegam ao site para decidir, em poucos minutos, se vale conversar com Clara. (Deduzido do conteúdo atual: vaga, freelance, "café virtual"; confirmar se houver outro público.)

## Product Purpose

Portfólio pessoal de Clara Lívia, desenvolvedora fullstack pleno na Cotabox (Fortaleza, CE). Mostra quem ela é, os projetos pessoais com estudo de caso, a experiência resumida e leva ao contato. Sucesso: o visitante entende o perfil rápido, abre pelo menos um projeto e entra em contato.

## Positioning

Fullstack que cuida do banco de dados à interface, com gosto por design (glassmorphism, estética Apple) e atenção a performance e segurança. Projetos reais, alguns usados por pessoas de verdade (House Pink, feito para o salão da mãe).

## Operating Context

Vue 3 + TypeScript + Tailwind 3 + Vite, publicado na Vercel em claralivia.dev. Bilíngue PT/EN (vue-i18n), dark mode por classe, paleta de comandos (⌘K), analytics da Vercel e GA. Conteúdo vive em src/locales/*.json.

## Capabilities and Constraints

- Rotas: `/` (home), `/sobre`, `/projetos/:slug`, 404.
- Todo texto vem dos arquivos de tradução; projetos novos entram só nos JSON.
- Mobile: backdrop-filter em muitos elementos travou a rolagem antes; vidro precisa ser adaptativo (blur só em telas maiores).
- Formulário de contato usa Web3Forms (VITE_WEB3FORMS_ACCESS_KEY).

## Brand Commitments

Pedido explícito da Clara (2026-11-09): manter o glassmorphism, aproximar da estética Apple, ser mais minimalista, menos informação por tela e sem cara de feito por IA; página contínua, com animações suaves e aparência profissional.

## Evidence on Hand

Seis projetos com estudo de caso e captura de tela em src/assets (House Pink, Sinc, Minhas Finanças, Portfólio, Beauty Manager, CV Studio). Foto em src/assets/minha-foto.webp. Sem depoimentos nem métricas de impacto; não inventar.

## Product Principles

1. Menos por tela: cada bloco da home tem uma só ideia; o detalhe fica na página de estudo de caso ou em /sobre.
2. O trabalho lidera: os projetos aparecem cedo e grandes.
3. Vidro com função: translucidez só onde há algo atrás para filtrar; nada decorativo.
4. Movimento que dá continuidade ao rolar, nunca que distraia nem que esconda conteúdo.

## Accessibility & Inclusion

Contraste AA, foco visível, `prefers-reduced-motion` respeitado, navegação por teclado (incluindo a paleta de comandos), PT e EN.
