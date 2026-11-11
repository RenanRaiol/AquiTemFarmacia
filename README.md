# AquiTemFarmacia

Aplicativo em React Native com Expo, sem um back-end próprio. A tela inicial oferece:

- A logo fornecida é usada na tela inicial e como ícone do aplicativo.
- **Funcionamento:** abre o HTML fornecido, incluído no app em `assets/funcionamento-farmacias.html`.
- **Encontrar farmácias:** abre uma busca no Google Maps para Araquari, configurada em `links.js`.

O HTML fornecido consulta um projeto Supabase existente e carrega a biblioteca Supabase pela internet. Portanto, essa tela precisa de conexão e continua dependendo do serviço configurado no próprio HTML. O restante do aplicativo não cria nem exige um novo servidor.

## Requisitos

- Node.js LTS e npm
- Expo Go para testar rapidamente ou Android Studio para executar/buildar no Android

## Instalação e execução

No terminal, dentro desta pasta:

```powershell
npm install
npm start
```

Leia o QR code com o Expo Go, ou pressione `a` no terminal com um emulador Android aberto. Para criar e executar um projeto Android nativo localmente, use `npx expo run:android` após instalar e configurar o Android Studio.

Para abrir a versão web, execute `npm run web` e acesse o endereço exibido pelo Expo. Em outro dispositivo na mesma rede Wi-Fi, use o endereço LAN exibido pelo Expo.

## Alterar links e conteúdo

- Edite `links.js` para mudar o endereço aberto pelo botão **Encontrar farmácias**.
- Substitua `assets/funcionamento-farmacias.html` para atualizar a página de funcionamento. O arquivo é empacotado no aplicativo; para distribuir uma versão atualizada do HTML, será necessário gerar e publicar uma nova versão do app.
- Links HTTP/HTTPS, telefone e e-mail navegados dentro da página são abertos fora do app.

O endereço `file:///C:/...` original não é utilizado pelo aplicativo: o arquivo HTML foi copiado para os recursos locais do projeto.
