.PHONY: ship

ship:
	cd build && tar czf ../wce-triage-ui.tgz *
	cp wce-triage-ui.tgz /Volumes/wce/wce-triage-ui.tgz