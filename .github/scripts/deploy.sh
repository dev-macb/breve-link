#!/usr/bin/env bash
set -Eeuo pipefail

# Executado por SSH, com o commit aprovado pelo CI como argumento.
sha=${1:-}
[[ $# == 1 && $sha =~ ^[0-9a-f]{40}$ ]] || { echo 'Commit inválido.' >&2; exit 2; }
cd /srv/apps/breve-link
# Serializa builds das duas aplicações na VPS de 1 CPU.
exec 9>"$HOME/.hostinger-deploy.lock"
flock -w 1800 9 || { echo 'Outro deploy continua em execução.' >&2; exit 1; }
[[ $(git branch --show-current) == main ]] || { echo 'O checkout da VPS deve estar na main.' >&2; exit 1; }
[[ -z $(git status --porcelain) ]] || { echo 'Há alterações locais na VPS; deploy interrompido.' >&2; exit 1; }
export GIT_TERMINAL_PROMPT=0
git fetch --no-tags origin +refs/heads/main:refs/remotes/origin/main
if [[ $(git rev-parse refs/remotes/origin/main) != "$sha" ]]; then
    echo 'A main já avançou; este deploy foi ignorado.'
    exit 0
fi
git merge --ff-only "$sha"
[[ $(git rev-parse HEAD) == "$sha" ]] || { echo 'O checkout não corresponde ao commit aprovado.' >&2; exit 1; }
docker compose config --quiet
docker compose build
if ! docker compose up -d --wait --wait-timeout 180; then
    docker compose ps
    echo 'A aplicação não ficou saudável. Confira os logs na VPS.' >&2
    exit 1
fi
docker compose ps
printf 'Deploy concluído: %s\n' "$sha"
