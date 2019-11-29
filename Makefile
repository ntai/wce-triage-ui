.PHONY: ship

ship:
	python generate_manifest.py
	npm run build
	cd build && tar czf ../wce-triage-ui.tgz *
	curl -u triage:thepasswordiswcetriage -T wce-triage-ui.tgz Http://release.cleanwinner.com/wce/


