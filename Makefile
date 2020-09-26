install:
	npm install
build:
	npm run build
develop:
	npm start
lint:
	npx eslint .
test:
	npm run test
test-coverage:
	npm test -- --coverage --coverageProvider=v8