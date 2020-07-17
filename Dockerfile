FROM node:10

WORKDIR /code
ADD . /code/

# global install & update
RUN npm i -g npm && npm i -g yarn

RUN yarn install

# build for production
RUN yarn build

# generate static project
RUN yarn generate

# Generating sha
RUN git rev-parse HEAD > REVISION
RUN git tag -l --points-at HEAD --sort -version:refname | head -1 > TAG
RUN git rev-parse --abbrev-ref HEAD > BRANCH

RUN yarn start --port 8000 --hostname 0.0.0.0
