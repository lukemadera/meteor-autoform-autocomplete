# lukemadera:autoform-autocomplete

An add-on Meteor package for aldeed:autoform. Provides a single custom input type, "lmautocomplete", which renders an input that is given a predictions dropdown.


## Demo

@todo


## Dependencies

- aldeed:autoform


## Installation

In a Meteor app directory:
```bash
meteor add lukemadera:autoform-autocomplete
```


## Usage

Specify "lmautocomplete" for the `type` attribute of any input and set the SimpleSchema to be an object:

```html
{{> afQuickField name="tag" type="lmautocomplete" opts=optsAutocomplete getPredictions=getPredictions}}
```

In the schema, which will then work with a `quickForm` or `afQuickFields`:

@todo
```js
AddressSchema =new SimpleSchema({
  fullAddress: {
    type: String
  }
});

Template.autoformAutocompleteBasic.helpers({
  optsGoogleplace: function() {
    return {
      // type: 'googleUI',
      // stopTimeoutOnKeyup: false,
      // googleOptions: {
      //   componentRestrictions: { country:'us' }
      // }
    }
  }
});
```