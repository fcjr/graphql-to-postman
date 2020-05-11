var converter = require('../../index'),
  convert = converter.convert,
  validate = converter.validate,
  getOptions = converter.getOptions,
  fs = require('fs'),
  path = require('path'),
  validSchemaJson = require('./fixtures/validSchema.json'),
  invalidSchemaJson = require('./fixtures/invalidSchema.json'),
  validSchemaSDL = fs.readFileSync(path.join(__dirname, './fixtures/validSchemaSDL.graphql')).toString(),
  issue10 = fs.readFileSync(path.join(__dirname, './fixtures/issue#10.graphql')).toString(),
  invalidSchemaSDL = fs.readFileSync(path.join(__dirname, './fixtures/invalidSchemaSDL.graphql')).toString(),
  expect = require('chai').expect;

describe('Converter tests', function () {
  describe('getOptions function', function () {
    it('should return array of options', function () {
      const options = getOptions();

      expect(options).to.be.an('array');
      expect(options[0]).to.be.an('object');
      expect(options[1]).to.be.an('object');
      expect(options[0].id).to.be.equal('includeDeprecatedFields');
      expect(options[1].id).to.be.equal('depth');
    });
  });

  describe('Convert function', function () {
    it('should generate a collection for a valid JSON schema', function (done) {
      convert({ type: 'string',
        data: JSON.stringify(validSchemaJson)
      }, {}, function (error, result) {
        if (error) {
          expect.fail(null, null, error);
          return done();
        }
        const collection = result.output[0].data;

        expect(collection.item[0].item[0].request.body.mode).to.be.equal('graphql');
        expect(collection.item[0].item[0].request.body.graphql).to.be.an('object');
        expect(collection.item[0].item[0].request.body.graphql.query).to.be.a('string');
        expect(collection.item[0].item[0].request.body.graphql.query).to.be.equal(
          'mutation bookTrips ($launchIds: [ID]!) {\n    ' +
          'bookTrips (launchIds: $launchIds) {\n        success\n        message\n    }\n}'
        );
        expect(collection.item[0].item[0].request.body.graphql.variables).to.be.a('string');
        expect(collection.item[0].item[0].request.body.graphql.variables).to.be.equal(
          '{\n  "launchIds": [\n    0\n  ]\n}'
        );
        return done();
      });
    });

    it('should generate a collection for a valid SDL schema', function (done) {
      convert({ type: 'string',
        data: validSchemaSDL
      }, {}, function (error, result) {
        if (error) {
          expect.fail(null, null, error);
          return done();
        }
        const collection = result.output[0].data;

        expect(collection.item[0].item[0].request.body.mode).to.be.equal('graphql');
        expect(collection.item[0].item[0].request.body.graphql).to.be.an('object');
        expect(collection.item[0].item[0].request.body.graphql.query).to.be.a('string');
        expect(collection.item[0].item[0].request.body.graphql.query).to.be.equal(
          'mutation bookTrips ($launchIds: [ID]!) {\n    ' +
          'bookTrips (launchIds: $launchIds) {\n        success\n        message\n    }\n}'
        );
        expect(collection.item[0].item[0].request.body.graphql.variables).to.be.a('string');
        expect(collection.item[0].item[0].request.body.graphql.variables).to.be.equal(
          '{\n  "launchIds": [\n    0\n  ]\n}'
        );

        return done();
      });
    });

    it('should not throw an error for schema containing an input type', function (done) {
      convert({ type: 'string',
        data: issue10
      }, {}, function (error, result) {
        if (error) {
          expect.fail(null, null, error);
          return done();
        }
        const collection = result.output[0].data;
        expect(result.result).to.be.equal(true);
        expect(collection.item[0].item[0].request.body.graphql.query).to.be.equal('mutation addUser ' +
        '($input: UserInput) {\n    addUser (input: $input) {\n        id\n        name\n    }\n}');

        return done();
      });
    });
  });

  describe('Validate function', function () {
    it('should return true for a valid JSON schema', function () {
      const value = validate({ type: 'string',
        data: JSON.stringify(validSchemaJson)
      });

      expect(value).to.be.an('object');
      expect(value.result).to.be.equal(true);
    });

    it('should return false for a invalid JSON schema', function () {
      const value = validate({ type: 'string',
        data: JSON.stringify(invalidSchemaJson)
      });

      expect(value).to.be.an('object');
      expect(value.result).to.be.equal(false);
    });

    it('should return false for a invalid SDL schema', function () {
      const value = validate({ type: 'string',
        data: invalidSchemaSDL
      });

      expect(value).to.be.an('object');
      expect(value.result).to.be.equal(false);
    });

    it('should return true for a valid SDL schema', function () {
      const value = validate({ type: 'string',
        data: validSchemaSDL
      });

      expect(value).to.be.an('object');
      expect(value.result).to.be.equal(true);
    });

    it('should return false for a graphql query', function () {
      const value = validate({ type: 'string',
        data: '{ hello }'
      });

      expect(value).to.be.an('object');
      expect(value.result).to.be.equal(false);
    });
  });
});
