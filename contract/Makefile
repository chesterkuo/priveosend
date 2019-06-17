CPP_IN=priveosend
CONTRACT_ACCOUNT=priveosend12
PK=EOS6MRyAjQq8ud7hVNYcfnVPJqcVpscN5So8BhtHuGYqET5GDW5CV
EOS_CONTRACTS_DIR=/Users/al/Projects/eos/eosio.contracts/build/contracts
CLEOS=cleos

build:
	eosio-cpp -I. -abigen $(CPP_IN).cpp -o $(CPP_IN).wasm
	
deploy: build
	$(CLEOS) set contract $(CONTRACT_ACCOUNT) . $(CPP_IN).wasm $(CPP_IN).abi
	
setup:
	$(CLEOS) system newaccount --stake-net "1.0000 EOS" --stake-cpu "1.0000 EOS" --buy-ram-kbytes 8000 eosio $(CONTRACT_ACCOUNT) $(PK) $(PK)
	$(CLEOS) set account permission $(CONTRACT_ACCOUNT) active '{"threshold": 1,"keys": [{"key": "$(PK)","weight": 1}],"accounts": [{"permission":{"actor":"$(CONTRACT_ACCOUNT)","permission":"eosio.code"},"weight":1}]}' owner -p $(CONTRACT_ACCOUNT)
	$(CLEOS) system newaccount --stake-net "1.0000 EOS" --stake-cpu "1.0000 EOS" --buy-ram-kbytes 8000 eosio angelo $(PK) $(PK)
	$(CLEOS) transfer eosio angelo "1000.0000 EOS"

prepare:
	$(CLEOS) push action priveosrules prepare '["$(CONTRACT_ACCOUNT)", "4,EOS"]' -p $(CONTRACT_ACCOUNT)

admclear:
	$(CLEOS) push action $(CONTRACT_ACCOUNT) admclear '["$(CONTRACT_ACCOUNT)"]' -p $(CONTRACT_ACCOUNT)
	
deposit:
	$(CLEOS) transfer $(CONTRACT_ACCOUNT) priveosrules "1.0000 EOS" -p $(CONTRACT_ACCOUNT)
	
test:
	$(CLEOS) push action $(CONTRACT_ACCOUNT) upload '["angelo", "01ba4719c80b6fe911b091a7c05124b64eeece964e09c058ef8f9805daca546b", "test1.pdf", "application/pdf"]' -p angelo
	
	
show:
	$(CLEOS) get table $(CONTRACT_ACCOUNT) $(CONTRACT_ACCOUNT) file