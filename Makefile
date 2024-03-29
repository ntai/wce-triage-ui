.PHONY: ship build local

ship: build local
	cd build && tar czf ../wce-triage-ui.tgz *
	curl -u triage:thepasswordiswcetriage -T wce-triage-ui.tgz https://www.release.cleanwinner.com/wce/

build:
	python3 generate_manifest.py
	npm run build


local:
	sudo rsync -av --delete /home/ntai/sand/wce-triage-ui/build/ /usr/local/share/wce/wce-triage-ui/
	sudo rsync -av --delete /home/ntai/sand/wce-triage-ui/build/ /var/lib/netclient/wcetriage_amd64/usr/local/share/wce/wce-triage-ui/
	sudo rsync -av --delete /home/ntai/sand/wce-triage-ui/build/ /var/lib/netclient/wcetriage_x32/usr/local/share/wce/wce-triage-ui/
