#!/bin/bash

function contains() {
    local n=$#
    local value=${!n}
    for ((i=1;i < $#;i++)) {
        if [ "${!i}" == "${value}" ]; then
            echo "y"
            return 0
        fi
    }
    echo "n"
    return 1
}

acceptable_versions=("patch" "minor" "major")
if [ $(contains "${acceptable_versions[@]}" "$1") == "y" ]
then
  echo "Retrieving tags..."
else
  echo "Error: Argument must be patch, minor, or major."
  exit 1
fi

git fetch --tag
current_version=$(git describe --abbrev=0 --tags)

echo $current_version

major_number=$(echo $current_version | cut -d'.' -f 1)
minor_number=$(echo $current_version | cut -d'.' -f 2)
patch_number=$(echo $current_version | cut -d'.' -f 3)

if [ "$1" = 'patch' ]
then
  patch_number=$(($patch_number + 1))
elif [ "$1" = 'minor' ]
then
  minor_number=$(($minor_number + 1))
  patch_number=0
elif [ "$1" = 'major' ]
then
  major_number=$(($major_number + 1))
  minor_number=0
  patch_number=0
fi

new_version="$major_number.$minor_number.$patch_number"

echo "Commiting new files..."

git add .
git commit -m "Committing before version $new_version"

echo "Pushing version..."
git tag $new_version
git push origin $new_version

echo "Successfully tagged with version $new_version"
