.PHONY: ship build local

build:
	python3 generate_manifest.py
	npm run build

ship: build local
	cd build && tar czf ../wce-triage-ui.tgz *
	curl -u triage:thepasswordiswcetriage -T wce-triage-ui.tgz https://www.release.cleanwinner.com/wce/

local:
	sudo rsync -av --delete /home/ntai/sand/wce-triage-ui/build/ /usr/local/share/wce/wce-triage-ui/
	sudo rsync -av --delete /home/ntai/sand/wce-triage-ui/build/ /var/lib/wcetriage/wcetriage_2004/usr/local/share/wce/wce-triage-ui/
