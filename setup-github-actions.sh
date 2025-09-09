#!/bin/bash

echo "🚀 Configurando GitHub Actions para Pre-Produção"
echo "================================================"

# Verificar se estamos no diretório correto
if [ ! -f "package.json" ]; then
    echo "❌ Execute este script na raiz do projeto"
    exit 1
fi

# Verificar se o Git está configurado
if [ ! -d ".git" ]; then
    echo "❌ Este não é um repositório Git"
    exit 1
fi

echo "✅ Repositório Git encontrado"

# Verificar se os workflows foram criados
if [ ! -d ".github/workflows" ]; then
    echo "❌ Diretório .github/workflows não encontrado"
    exit 1
fi

echo "✅ Workflows do GitHub Actions configurados"

# Listar workflows disponíveis
echo ""
echo "📋 Workflows Disponíveis:"
echo "1. pre-production.yml - Build e preparação para deploy"
echo "2. deploy-preprod.yml - Deploy automático no servidor"
echo "3. setup-preprod.yml - Configuração do servidor"
echo "4. test-local.yml - Testes locais"

echo ""
echo "🔧 Próximos Passos:"
echo "1. Faça commit e push dos arquivos:"
echo "   git add .github/"
echo "   git commit -m 'Add GitHub Actions workflows for pre-production'"
echo "   git push origin main"

echo ""
echo "2. Configure os secrets do GitHub:"
echo "   - Vá em Settings > Secrets and variables > Actions"
echo "   - Adicione: SSH_PRIVATE_KEY, SSH_USER, SSH_HOST"

echo ""
echo "3. Crie as branches de desenvolvimento:"
echo "   git checkout -b develop"
echo "   git push origin develop"
echo "   git checkout -b staging"
echo "   git push origin staging"

echo ""
echo "4. Execute o workflow de setup do servidor:"
echo "   - Vá em Actions > Setup Pre-Production Environment"
echo "   - Execute manualmente com os dados do seu servidor"

echo ""
echo "5. Teste o deploy:"
echo "   - Faça push para develop ou staging"
echo "   - O deploy será executado automaticamente"

echo ""
echo "🎉 Configuração concluída!"
echo "Consulte .github/README.md para mais detalhes"
