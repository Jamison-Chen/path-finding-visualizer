#!/bin/bash
if [[ -z $1 ]]; then
    echo Please provide the commit message.
else
    # Remember to switch to the corresponding username and email for this repo
    git config user.name "Jamison Chen"
    git config user.email "106208004@g.nccu.edu.tw"
    npm run build
    git add .
    git commit -m "$1"
    # Remember to switch to the corresponding ssh key for this repo
    ssh-add -D
    ssh-add ~/.ssh/id_rsa
    git push origin master
fi