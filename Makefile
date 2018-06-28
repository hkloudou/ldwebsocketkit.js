git:
	- git add . && git commit -m 'auto commit' && git push origin master -f --tags
tag:
	- git add . && git commit -m 'auto commit'
	git autotag && git push origin master -f --tags
	@echo "current version:`git describe`"
