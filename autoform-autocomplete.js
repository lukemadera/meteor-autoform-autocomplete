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
  @param {Function} [onUpdateVals] A function to call every time value(s) are updated (set, added, removed). It is passed either an array of objects (if multi) or just one object.
    @param {String} optsInstid The same atts.opts.instid that was passed in (to uniquely identify)
    @param {Object|Array} vals Array if multi is set, object otherwise of:
      @param {String} value
      @param {String} name Set if multi

API:
lmAfAutocomplete.updateVal


@toc
lmAfAutocomplete.
  3. setVals
  15. removeVals
  16. addVals
  18. removeAllVals
lmAfAutocompletePrivate.
  17. onUpdateVals
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

var lmAfAutocompletePrivate ={};

/**
//for external calls in, need to store reference to template instance to get the correct one so for EACH instance of this package / template, will store two values: a passed in instid (for external reference) as a key and that is an object with the internal template instance. This will allow going back and forth between the two and allow external interaction with the proper template instance.
@example
  lmAfAutocompletePrivate.inst ={
    'inst1': {
      templateInst: templateInst1,
      optsInstid: '',
      values: [{value: 'val1', name:'name1'}],
      multi: 0
    },
    'inst2': {
      templateInst: templateInst2,
      optsInstid: 'asfdlkjl3lajkf',
      values: [{value: 'val2', name:'name2'}],
      multi: 1
    }
  };
*/
lmAfAutocompletePrivate.inst ={};

/**
@toc 3.
@param {Array|Object} vals Array of objects (or one single object) to set, each object has:
  @param {String} [value] If not set, will be assumed it is a NEW value to add
  @param {String} name The display text
@param {Object} params
  @param {Object} [templateInst] (for internal use) One of 'templateInst' or 'optsInstid' is required
  @param {Object} [optsInstid] The opts.instid passed in with the template options (for external use)
*/
lmAfAutocomplete.setVals =function(vals, params) {
  console.log('setVals: ', vals);
  if(typeof(vals) ==='object' && !nrArray.isArray(vals)) {
    vals =[vals];
  }
  var templateInst =lmAfAutocompletePrivate.getTemplateInst(params);
  if(templateInst) {
    var instid =templateInst.data.atts['data-schema-key'];

    //if no multi, only set/add ONE
    if(!lmAfAutocompletePrivate.inst[instid].multi) {
      vals =vals.slice(0, 1);
    }

    var opts =templateInst.opts.get();
    var ii;
    for(ii =0; ii<vals.length; ii++) {
      if(vals[ii].value ===undefined || !vals[ii].value) {
        vals[ii].value =opts.newNamePrefix+vals[ii].name;
      }
    }

    lmAfAutocompletePrivate.onUpdateVals(instid, templateInst, vals, {});
  }
};

/**
@toc 15.
@param {Array|Object} vals Array of objects (or one single object) to remove, each object has:
  @param {String} value
@param {Object} params
  @param {Object} [templateInst] (for internal use) One of 'templateInst' or 'optsInstid' is required
  @param {Object} [optsInstid] The opts.instid passed in with the template options (for external use)
  // @param {Boolean} [noOnUpdate] True to NOT run the on update (i.e. if just using this to remove all values befor ea set, do not want to call it twice)
*/
lmAfAutocomplete.removeVals =function(vals, params) {
  console.log('removeVals: ', vals);
  if(typeof(vals) ==='object' && !nrArray.isArray(vals)) {
    vals =[vals];
  }
  var templateInst =lmAfAutocompletePrivate.getTemplateInst(params);
  if(templateInst) {
    var instid =templateInst.data.atts['data-schema-key'];
    var curVals =lmAfAutocompletePrivate.inst[instid].values;
    var ii, index1;
    //have to go through from the END since removing elements and do not want to mess up indices
    for(ii =(curVals.length-1); ii<=0; ii--) {
      index1 =nrArray.findArrayIndex(vals, 'value', curVals[ii].value, {});
      if(index1 >-1) {
        curVals =nrArray.remove(curVals, index1);
      }
    }

    // if(params.noOnUpdate ===undefined || !params.noOnUpdate) {
      lmAfAutocompletePrivate.onUpdateVals(instid, templateInst, curVals, {});
    // }
  }
};

/**
@toc 16.
@param {Array|Object} vals Array of objects (or one single object) to add, each object has:
  @param {String} value
@param {Object} params
  @param {Object} [templateInst] (for internal use) One of 'templateInst' or 'optsInstid' is required
  @param {Object} [optsInstid] The opts.instid passed in with the template options (for external use)
*/
lmAfAutocomplete.addVals =function(vals, params) {
  console.log('addVals: ', vals);
  if(typeof(vals) ==='object' && !nrArray.isArray(vals)) {
    vals =[vals];
  }
  var templateInst =lmAfAutocompletePrivate.getTemplateInst(params);
  if(templateInst) {
    var instid =templateInst.data.atts['data-schema-key'];
    
    //if no multi, clear out first and only set/add ONE
    if(!lmAfAutocompletePrivate.inst[instid].multi) {
      lmAfAutocomplete.removeAllVals(params);
      vals =vals.slice(0, 1);
    }

    var curVals =lmAfAutocompletePrivate.inst[instid].values;
    var ii, index1;
    for(ii =0; ii<vals.length; ii++) {
      index1 =nrArray.findArrayIndex(curVals, 'value', vals[ii].value, {});
      if(index1 <0) {
        curVals.push(vals[ii]);
      }
    }

    lmAfAutocompletePrivate.onUpdateVals(instid, templateInst, curVals, {});
  }
};

/**
@toc 18.
@param {Object} params
  @param {Object} [templateInst] (for internal use) One of 'templateInst' or 'optsInstid' is required
  @param {Object} [optsInstid] The opts.instid passed in with the template options (for external use)
  // @param {Boolean} [noOnUpdate] True to NOT run the on update (i.e. if just using this to remove all values befor ea set, do not want to call it twice)
*/
lmAfAutocomplete.removeAllVals =function(params) {
  var templateInst =lmAfAutocompletePrivate.getTemplateInst(params);
  if(templateInst) {
    var instid =templateInst.data.atts['data-schema-key'];
    var curVals =[];
    lmAfAutocompletePrivate.onUpdateVals(instid, templateInst, curVals, {});
  }
};



/**
@toc 17.
*/
lmAfAutocompletePrivate.onUpdateVals =function(instid, templateInst, vals, params) {
  //update UI too
  var ele =templateInst.find('input.lm-autoform-autocomplete-input');
  if(lmAfAutocompletePrivate.inst[instid].multi) {
    ele.value ='';    //blank out
  }
  else if(vals.length) {
    ele.value =vals[0].name;
  }

  lmAfAutocompletePrivate.inst[instid].values =vals;
  templateInst.values.set(vals);
  lmAfAutocompletePrivate.hide(templateInst, {});

  if(vals.length && templateInst.data.atts.opts.instid !==undefined && templateInst.data.atts.opts.onUpdateVals !==undefined) {
    var valToSend =vals;
    if(!lmAfAutocompletePrivate.inst[instid].multi) {
      valToSend =valToSend[0];
    }
    templateInst.data.atts.opts.onUpdateVals.call(templateInst, templateInst.data.atts.opts.instid, valToSend, {});
  }
};

/**
@toc 12.
@param {Object} params
  @param {Object} [templateInst] (for internal use) One of 'templateInst' or 'optsInstid' is required
  @param {Object} [optsInstid] The opts.instid passed in with the template options (for external use)
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
  else if(params.optsInstid) {
    var xx;
    for(xx in lmAfAutocompletePrivate.inst) {
      if(lmAfAutocompletePrivate.inst[xx].optsInstid ===params.optsInstid) {
        templateInst =lmAfAutocompletePrivate.inst[xx].templateInst;
        break;
      }
    }
  }
  return templateInst;
}

/**
@toc 1.
*/
lmAfAutocompletePrivate.init =function(templateInst, params) {
  this.initOpts(templateInst, params);

  var vals =templateInst.data.value;
  if(vals ===undefined || !vals) {
    vals =[];
  }
  if(typeof(vals) ==='object' && !nrArray.isArray(vals)) {
    vals =[vals];
  }

  lmAfAutocomplete.setVals(vals, {templateInst:templateInst});
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
  opts.multi =parseInt(opts.multi, 10);

  if(opts.instid ===undefined) {
    console.log('lmAfAutocomplete: opts.instid not set (it is required if you want to use any (external) api calls)');
    opts.instid =false;
  }
  var instid =templateInst.data.atts['data-schema-key'];
  lmAfAutocompletePrivate.inst[instid] ={
    templateInst: templateInst,
    optsInstid: opts.instid,
    multi: opts.multi,
    values: []
  };

  templateInst.opts.set(opts);
};

/**
@toc 4.
@param {Object} params
  @param {Boolean} [noShow] True to NOT display predictions
*/
lmAfAutocompletePrivate.getPredictions =function(templateInst, val, params) {
  var predictions =[];
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
  else {
    //filter out already selected values
    //@todo
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
    var valOut =lmAfAutocompletePrivate.inst[instid].values;
    if(!lmAfAutocompletePrivate.inst[instid].multi) {
      valOut =valOut[0];
    }
    console.log('afAutocomplete valueOut: ', valOut);
    return valOut;
  }
});

/**
@toc 8.
*/
Template.afAutocomplete.created =function() {
  this.opts =new ReactiveVar({});

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
  },
  values: function() {
    return Template.instance().values.get();
  },
  opts: function() {
    return Template.instance().opts.get();
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
    lmAfAutocomplete.addVals([this], {templateInst:template});
  },
  'click .lm-autoform-autocomplete-selected-value': function(evt, template) {
    lmAfAutocomplete.removeVals([this], {templateInst:template});
  }
});