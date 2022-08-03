FROM public.ecr.aws/docker/library/node:16-bullseye-slim

WORKDIR /build

COPY tsconfig.json /build/
COPY sst.json /build/
COPY package.json /build/
COPY package-lock.json /build/
COPY services/ /build/services/
COPY stacks/ /build/stacks/

RUN npm install
RUN npm test

CMD npm run build