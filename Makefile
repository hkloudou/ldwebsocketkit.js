push:
	-git add . && git commit -m 'build auto commit' && git push origin --tags
tag:
	-git tag -f 0.1.0
