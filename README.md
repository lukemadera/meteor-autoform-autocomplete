# lukemadera:autoform-autocomplete

Autocomplete, select, multi-select all in one!

An add-on Meteor package for aldeed:autoform. Provides a single custom input type, "lmautocomplete", which renders an input that is given a predictions dropdown.


## Demo

[Demo](http://beteal.org/org-edit/values)

[Source](https://github.com/lukemadera/beteal/tree/master/packages/autoform-tag)


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
{{> afQuickField name="tag" type="lmautocomplete" opts=optsAutocomplete}}
```

In the schema, which will then work with a `quickForm` or `afQuickFields`:

```js
TagsSchema =new SimpleSchema({
  tags: {
    type: [Object]
  },
  "tags.$._id": {
    type: String
  },
  "tags.$.name": {
    type: String
  }
});

Template.autoformAutocompleteBasic.helpers({
  optsAutocomplete: function() {
    return {
      instid: 'alfkjeaf',
      // multi: 1,
      // createNew: true,
      // newNamePrefix: '_',
      getPredictions: function(name, params) {
        var ret ={predictions:[]};
        var query ={
          name: {
            $regex: '^'+name,
            $options: 'i'
          }
        };
        var predictions1 =TagsCollection.find(query, {fields: {_id:1, name:1}}).fetch();
        ret.predictions =predictions1.map(function(obj) {
          return {
            value: obj._id,
            name: obj.name
          }
        });
        return ret;
      },
      // onUpdateVals: function(instid, val, params) {
      //   console.log(instid, val);
      // },
    }
  }
});
```

### API

```js
/**
@param {Array|Object} vals Array of objects (or one single object) to set, each object has:
  @param {String} [value] If not set, will be assumed it is a NEW value to add
  @param {String} name The display text
@param {Object} params
  @param {Object} [templateInst] (for internal use) One of 'templateInst' or 'optsInstid' is required
  @param {Object} [optsInstid] The opts.instid passed in with the template options (for external use)
*/
lmAfAutocomplete.setVals(vals, {optsInstid:'alfkj3'});

/**
@param {Array|Object} vals Array of objects (or one single object) to remove, each object has:
  @param {String} value
@param {Object} params
  @param {Object} [templateInst] (for internal use) One of 'templateInst' or 'optsInstid' is required
  @param {Object} [optsInstid] The opts.instid passed in with the template options (for external use)
  // @param {Boolean} [noOnUpdate] True to NOT run the on update (i.e. if just using this to remove all values befor ea set, do not want to call it twice)
*/
lmAfAutocomplete.removeVals(vals, {optsInstid:'asflkje'});

/**
@param {Array|Object} vals Array of objects (or one single object) to add, each object has:
  @param {String} value
@param {Object} params
  @param {Object} [templateInst] (for internal use) One of 'templateInst' or 'optsInstid' is required
  @param {Object} [optsInstid] The opts.instid passed in with the template options (for external use)
*/
lmAfAutocomplete.addVals(vals, {optsInstid:'alkefe'});

/**
@param {Object} params
  @param {Object} [templateInst] (for internal use) One of 'templateInst' or 'optsInstid' is required
  @param {Object} [optsInstid] The opts.instid passed in with the template options (for external use)
*/
lmAfAutocomplete.removeAllVals({optsInstid:'aefeafe'});
```