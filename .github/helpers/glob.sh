#!/usr/bin/env bash

# this script globs a folder of files, then subsequently uploads the 
# glob to bootstrap.urbit.org and replaces the hash in the docket file.
# assumes gcloud credentials are loaded and gsutil installed.

# $1: the folder of files to glob
# $2: the location of the docket file

# globber is a prebooted and docked fakezod
curl https://bootstrap.urbit.org/globber.tar.gz | tar xzk
./zod/.run -d

dojo () {
  curl -s --data '{"source":{"dojo":"'"$1"'"},"sink":{"stdout":null}}' http://localhost:12321    
}

hood () {
  curl -s --data '{"source":{"dojo":"+hood/'"$1"'"},"sink":{"app":"hood"}}' http://localhost:12321    
}

hood "merge %work our %base"
hood "mount %work"

rm -rf zod/work/*

rsync -avL $1 zod/work/glob
hood "commit %work"
dojo "-garden!make-glob %work /glob"

gsutil cp zod/.urb/put/*.glob gs://bootstrap.urbit.org
hash=$(ls -1 -c zod/.urb/put | head -1 | sed -rn "s/glob-([a-z0-9\.]*).glob/\1/")
sed -rn "s/( *glob\-http\+\['https:\/\/bootstrap.urbit.org\/glob\-)[a-z0-9\.]*glob' *[a-z0-9\.]*\]/\1$hash.glob' $hash]/g" $2

hood "exit"
