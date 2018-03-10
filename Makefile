push:
	-git add .
	-git tag -f 0.1.0
	-git commit -m 'build auto commit'
	-git push origin master
