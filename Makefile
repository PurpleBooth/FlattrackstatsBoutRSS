.PHONY: help

help:
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

deploy: ## Build, push and deploy project
	docker build -t gcr.io/purplebooth-gke/github-purplebooth-flattrackstatsboutrss:latest .
	docker push gcr.io/purplebooth-gke/github-purplebooth-flattrackstatsboutrss:latest
ifeq (, $(shell helm list --all | grep "rollerrss" ))
	helm install --name=rollerrss ./helm -f secrets/helm-secrets.yml
else
	helm upgrade rollerrss ./helm -f secrets/helm-secrets.yml
endif