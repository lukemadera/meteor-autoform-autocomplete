Package.describe({
  name: 'lukemadera:autoform-autocomplete',
  version: '1.0.1',
  // Brief, one-line summary of the package.
  summary: 'Autoform autocomplete, select, multi-select (with create new option) all in one!',
  // URL to the Git repository containing the source code for this package.
  git: 'https://github.com/lukemadera/meteor-autoform-autocomplete',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.1.0.2');

  api.use('templating@1.0.0');
  api.use('blaze@2.0.0');
  api.use('aldeed:autoform@4.0.0 || 5.0.0');
  api.use('reactive-var@1.0.5');
  api.use('less@1.0.14');
  api.use('notorii:array@0.0.1');

  api.addFiles([
    'autoform-autocomplete.html',
    'autoform-autocomplete.less',
    'autoform-autocomplete.js'
  ], 'client');

  api.export('lmAfAutocomplete');
});

Package.onTest(function(api) {
  api.use('tinytest');
  api.use('lukemadera:autoform-autocomplete');
  api.addFiles('autoform-autocomplete-tests.js');
});
