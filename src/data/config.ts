export const CONFIG = {
  isDemo: true,
  campaignName: 'MATCH 3',
  campaignSubtitle: 'o trio do seu paladar',
  showPrices: true,
  trioDiscountPercent: 20 as number | null, // confirmado com o cliente em 26/09/2026
  priceNote: 'Preços de referência do catálogo de setembro de 2026, sujeitos a alteração e à disponibilidade em loja.',
  storeName: 'Armazém dos Importados',
  storeAddress: "Rua Anita Garibaldi, 448, Mont'Serrat, Porto Alegre",
  mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Armaz%C3%A9m%20dos%20Importados%20Rua%20Anita%20Garibaldi%20448%20Porto%20Alegre',
  whatsappNumber: '5551997647911', // formato 55 + DDD + número; vazio esconde o botão
  loadingMs: 1400,
  adminPath: '/painel', // painel da loja, sem senha na fase de demo
};
