/**
@param {Object} [atts.opts]
  @param {String} [instid] Required to use any external API calls
  @param {Number} [multi =0] Set to 1 to make a multi select rather than a normal select
  @param {String} [newNamePrefix ='__'] The prefix that will be used for creating a new name (if no match)
  @param {Function} getPredictions The function to call to look up predictions for the autocomplete. It is passed:
    @param {String} name The text input by the user to look up / match to
    @param {Object} [params]
    @return {Object}
      @param {Array} predictions Array of objects with the predictions. Each object should have:
        @param {String} value
        @param {String} name
  @param {Function} [updateVal] A function to call every time a value is selected. It is passed:
    @param {String} instid The same atts.opts.instid that was passed in (to uniquely identify)
    @param {Object} val
      @param {String} value
      @param {String} name

API:
lmAfAutocomplete.updateVal


@toc
lmAfAutocomplete.
  3. updateVal
lmAfAutocompletePrivate.
  12. getTemplateInst
  1. init
  13. destroy
  2. initOpts
  4. getPredictions
  5. hide
  6. show
7. AutoForm.addInputType("lmautocomplete",..
Template.afAutocomplete.
  8. created
  9. rendered
  14. destroyed
  10. helpers
  11. events
*/

lmAfAutocomplete ={};

var VAL ={};    //one per instid

var lmAfAutocompletePrivate ={};

/**
//for external calls in, need to store reference to template instance to get the correct one so for EACH instance of this package / template, will store two values: a passed in instid (for external reference) as a key and that is an object with the internal template instance. This will allow going back and forth between the two and allow external interaction with the proper template instance.
@example
  lmAfAutocompletePrivate.inst ={
    'inst1': {
      templateInst: templateInst1,
      values: [{value: 'val1', name:'name1'}],
      multi: 0
    },
    'inst2': {
      templateInst: templateInst2,
      values: [{value: 'val2', name:'name2'}],
      multi: 1
    }
  };
*/
lmAfAutocompletePrivate.inst ={};

/**
@toc 3.
@param {Object} val
  @param {String} value
  @param {String} name The display text
@param {Object} params
  @param {Object} [templateInst] (for internal use) One of 'templateInst' or 'instid' is required
  @param {Object} [instid] The opts.instid passed in with the template options (for external use)
*/
lmAfAutocomplete.updateVal =function(val, params) {
  console.log('updateVal: ', val);
  var templateInst =lmAfAutocompletePrivate.getTemplateInst(params);
  if(templateInst) {
    var instid =templateInst.data.atts['data-schema-key'];
    var opts =templateInst.opts;
    var val1 =VAL[instid];
    if(val.value) {
      val1.value =val.value;
    }
    else {
      val1.value =opts.newNamePrefix+val.name;
    }
    val1.name =val.name;

    //update UI too
    var ele =templateInst.find('input.lm-autoform-autocomplete-input');
    ele.value =val.name;

    lmAfAutocompletePrivate.hide(templateInst, {});
    VAL[instid] =val1;

    if(templateInst.data.atts.opts.instid !==undefined && templateInst.data.atts.opts.updateVal !==undefined) {
      templateInst.data.atts.opts.updateVal.call(templateInst, templateInst.data.atts.opts.instid, val1, {});
    }
  }
};


/**
@toc 12.
*/
lmAfAutocompletePrivate.getTemplateInst =function(params) {
  var templateInst =false;
  if(params.templateInst) {
    templateInst =params.templateInst;
  }
  else if(params.instid) {
    if(lmAfAutocompletePrivate.inst[params.instid] !==undefined) {
      templateInst =lmAfAutocompletePrivate.inst[params.instid].templateInst;
    }
  }
  return templateInst;
}

/**
@toc 1.
*/
lmAfAutocompletePrivate.init =function(templateInst, params) {
  this.initOpts(templateInst, params);

  var val =templateInst.data.value;
  if(typeof(val) ==='string') {
    val ={
      name: val
    };
  }
  var instid =templateInst.data.atts['data-schema-key'];
  VAL[instid] =val;

  //has to be AFTER VAL[instid] is set
  if(val.name && val.value) {
    lmAfAutocomplete.updateVal(val, {templateInst:templateInst});
  }
};

/**
@toc 13.
*/
lmAfAutocompletePrivate.destroy =function(templateInst, params) {
  //remove instid id key
  var xx;
  for(xx in lmAfAutocompletePrivate.inst) {
    if(lmAfAutocompletePrivate.inst[xx].templateInst ===templateInst) {
      delete lmAfAutocompletePrivate.inst[xx];
      break;
    }
  }
};

/**
@toc 2.
*/
lmAfAutocompletePrivate.initOpts =function(templateInst, params) {
  var optsDefault ={
    newNamePrefix: '__',
    multi: 0
  };
  var xx, opts;
  opts =EJSON.clone(templateInst.data.atts.opts);
  if(opts ===undefined) {
    opts =EJSON.clone(optsDefault);
  }
  else {
    //extend
    for(xx in optsDefault) {
      if(opts[xx] ===undefined) {
        opts[xx] =optsDefault[xx];
      }
    }
  }

  //if already passed in, just use the SAME instid. Otherwise create a new one.
  if(opts.instid ===undefined) {
    console.log('lmAfAutocomplete: opts.instid not set (it is required if you want to use any (external) api calls)');
    opts.instid ="lmAfAutocomplete"+(Math.random() + 1).toString(36).substring(7);
  }
  lmAfAutocompletePrivate.inst[opts.instid] ={
    templateInst: templateInst,
    multi: opts.multi,
    values: []
  };

  templateInst.opts =opts;
};

/**
@toc 4.
@param {Object} params
  @param {Boolean} [noShow] True to NOT display predictions
  // @param {Boolean} [setVal] True to also set the value (i.e. for init)
*/
lmAfAutocompletePrivate.getPredictions =function(templateInst, val, params) {
  var predictions =[];
  // var retPredictions =templateInst.getPredictions(val, {});
  var retPredictions =templateInst.data.atts.opts.getPredictions.call(templateInst, val, {});
  predictions =retPredictions.predictions;
  //if none, show the val for allowing creation
  if(!predictions.length) {
    predictions =[
      {
        name: val,
        value: '',
        xDisplay: {
          name: '*'+val
        }
      }
    ];
  }
  templateInst.predictions.set(predictions);
  if(params.noShow ===undefined || !params.noShow) {
    this.show(templateInst, {});
  }
};

/**
@toc 5.
*/
lmAfAutocompletePrivate.hide =function(templateInst, params) {
  var classes =templateInst.classes.get();
  classes.predictions ='hidden';
  templateInst.classes.set(classes);
};

/**
@toc 6.
*/
lmAfAutocompletePrivate.show =function(templateInst, params) {
  var classes =templateInst.classes.get();
  classes.predictions ='visible';
  templateInst.classes.set(classes);
};

/**
@toc 7.
*/
AutoForm.addInputType("lmautocomplete", {
  template: "afAutocomplete",
  valueIn: function(val) {
    //will convert to display value later after set / extend opts
    return val;
  },
  valueOut: function() {
    var instid =this.attr('data-schema-key');
    console.log('afAutocomplete valueOut: ', VAL[instid]);
    return VAL[instid];
  }
});

/**
@toc 8.
*/
Template.afAutocomplete.created =function() {
  this.opts ={};

  this.predictions =new ReactiveVar([]);
  this.classes =new ReactiveVar({
    predictions: 'hidden'
  });

  this.values =new ReactiveVar([]);
};

/**
@toc 9.
*/
Template.afAutocomplete.rendered =function() {
  //LAME! need timeout otherwise current value sometimes is not set yet..   //@todo - fix this
  var templateInst =this;
  lmAfAutocompletePrivate.init(templateInst, {});
  setTimeout(function() {
    lmAfAutocompletePrivate.init(templateInst, {});
  }, 750);
};

/**
@toc 14.
*/
Template.afAutocomplete.destroyed =function() {
  lmAfAutocompletePrivate.destroy(this, {});
};

/**
@toc 10.
*/
Template.afAutocomplete.helpers({
  //fix to avoid error for passed in object
  // - https://github.com/aldeed/meteor-autoform-bs-datepicker/issues/3
  // - https://github.com/aldeed/meteor-autoform-bs-datepicker/commit/3977aa69b61152cf8c0f731a11676b087d2ec9df
  atts: function() {
    var atts =EJSON.clone(this.atts);
    delete atts.opts;
    return atts;
  },
  classes: function() {
    return Template.instance().classes.get();
  },
  predictions: function() {
    return Template.instance().predictions.get();
  }
});

/**
@toc 11.
*/
Template.afAutocomplete.events({
  'keyup .lm-autoform-autocomplete-input': function(evt, template) {
    lmAfAutocompletePrivate.getPredictions(template, evt.target.value, {});
  },
  'click .lm-autoform-autocomplete-prediction-item': function(evt, template) {
    lmAfAutocomplete.updateVal(this, {templateInst:template});
  }
});