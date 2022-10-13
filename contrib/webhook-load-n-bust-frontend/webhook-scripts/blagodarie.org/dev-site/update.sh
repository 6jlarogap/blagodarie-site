#! /bin/bash

# --- configurable parameters ------------------------
VER_="dev"
GIT_BRANCH_="dev-site"
FOLDERS_='blagodarie'
# --- end of configurable parameters -----------------

root_dir_="/home/www-data/blagodarie.org.busted"
tempo_="tempo_"

cd "$root_dir_/git/$VER_"
git checkout "$GIT_BRANCH_"
git pull

rm -rf "$root_dir_/busted/$VER_/$tempo_"
for f in $FOLDERS_; do
    mkdir -p "$root_dir_/busted/$VER_/$tempo_/$f"
    cp -pr "$root_dir_/git/$VER_/$f" "$root_dir_/busted/$VER_/$tempo_/"
done 

cd "$root_dir_/busted/"
for f in $FOLDERS_; do
    grunt "cacheBust:${VER_}_${f}"
done

boosted_folder_=`date "+%s.%0N"`
cd "$root_dir_/busted/$VER_/"
mv "$tempo_" "$boosted_folder_"

cd "$root_dir_/link/"
ln -sfn "$root_dir_/busted/$VER_/$boosted_folder_" "$VER_"

cd "$root_dir_/busted/$VER_/"
../leave_only.pl "$boosted_folder_"
