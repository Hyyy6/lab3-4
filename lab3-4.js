if(Meteor.isClient){

    Template.Invent.helpers({
        'kit': function () {
            if(!Session.get("sortSwitch")) {
                $('.timeRented').hide();
                return InventList.find({size: {$gte: 0}});
            }
            else {
                $('.timeRented').show();
                //var arr = [];
                var overallTime;

                InventList.find({size: {$gte: 0}}).fetch().forEach(function(kit) {
                    overallTime = 0;

                    JournalList.find({type: kit.type, size: kit.size}).fetch().forEach(function (log) {
                        if (log.dateIn == 99999999)
                            overallTime += moment().diff(moment(log.dateOut, "YYYYMMDD"), "days");
                        else
                            overallTime += moment(log.dateIn, "YYYYMMDD").diff(moment(log.dateOut, "YYYYMMDD"), "days");
                    });

                    InventList.update({_id: kit._id}, {$set: {timeRented: overallTime}})
                });
                    return InventList.find({size: {$gte: 0}}, {sort: {timeRented: -1}});

            }
        },
        'selectedClass': function () {
            var kitId = this._id;
            //console.log(kitId);
            var selectedKit = Session.get('selectedKit');
            //console.log(selectedKit);
            if(kitId._str == selectedKit._str){
                return "selected"
            }
        },
        'selectedKit': function(){
            var selectedKit = Session.get('selectedKit');
            return InventList.findOne({ _id: selectedKit });
        }
    });

    Template.Invent.events({
        'submit form': function(event){
            event.preventDefault();
            var inventType = event.target.inventType.value;
            var inventSize = parseInt(event.target.inventSize.value);
            //console.log(playerNameVar);
            var kit = InventList.findOne({type: inventType, size: inventSize});
            if (kit != undefined){
                InventList.update({_id: kit._id}, {$inc: {quantity: 1}});
            } else {
                InventList.insert({type: inventType, size: inventSize, quantity: 1});
            }
            //event.target.playerName.value = "";
        },
        'change #sortSwitch': ()=>{
            Session.set("sortSwitch", $('#sortSwitch').is(':checked'));
        },
        'click .kit': function(event){
            Session.set('selectedKit', this._id);
            $('input[name="inventType"]').val(this.type);
            $('input[name="inventSize"]').val(this.size);
        },
        'click .removeInvent': function(){
            var selectedKit = Session.get('selectedKit');
            var kit = InventList.findOne({_id: selectedKit});
            if (kit.quantity > 0){
                InventList.update({_id: kit._id}, {$inc: {quantity: -1}});
            }
        }
    });

    Template.Journal.helpers({
        'log': function () {
            return JournalList.find();
        },
        'selectedClass': function () {
            var logId = this._id;
            //console.log(kitId);
            var selectedLog = Session.get('selectedLog');
            //console.log(selectedKit);
            if(logId._str == selectedLog._str){
                return "selected"
            }
        },
        'selectedLog': function(){
            var selectedKit = Session.get('selectedLog');
            return InventList.findOne({ _id: selectedKit });
        }
    });

    Template.Journal.events({
        'submit form': function(event){
            event.preventDefault();
            var _name = event.target.name.value;
            var inventType = event.target.inventType.value;
            var inventSize = parseInt(event.target.inventSize.value);
            var _dateOut = moment(parseInt(event.target.dateOut.value), "YYYYMMDD", true);
            var _dateIn = moment(parseInt(event.target.dateIn.value), "YYYYMMDD", true);

            if(((_dateOut._i > _dateIn._i) && _dateIn._i != 99999999) || !_dateOut._isValid || (!_dateIn._isValid && _dateIn._i != 99999999)){
                alert("check dates");
                return;
            }


            var kit = InventList.findOne({type: inventType, size: inventSize});
            if (kit == undefined || kit.quantity <= 0){
                alert("No such kit");
                return;
            } else {
                InventList.update({_id: kit._id}, {$inc: {quantity: -1}});
                JournalList.insert({name: _name, type: inventType, size: inventSize, dateOut: _dateOut._i, dateIn: _dateIn._i});
            }
        },
        'click .log': function(event){
            Session.set('selectedLog', this._id);
            $('input[name="inventType"]').val(this.type);
            $('input[name="inventSize"]').val(this.size);
        },
        'click .turnIn': function(){
            var selectedLog = Session.get('selectedLog');
            var log = JournalList.findOne({_id: selectedLog});
            if(log.dateIn != 99999999){
                alert("already turned in");
                return;
            } else {
                var kit = InventList.findOne({type: log.type, size: log.size});
                InventList.update({_id: kit._id}, {$inc: {quantity: 1}});
                JournalList.update({_id: log._id}, {$set: {dateIn: Number(moment(new Date()).format("YYYYMMDD"))}})

            }
        },
        'click .removeLog': function(){
            var selectedLog = Session.get('selectedLog');
            var log = JournalList.findOne({_id: selectedLog});
            var kit = InventList.findOne({type: log.type, size: log.size});
            if (log.dateIn != 99999999)
                InventList.update({_id: kit._id}, {$inc: {quantity: 1}});
            JournalList.remove({_id: log._id})
        }
    });
}

if(Meteor.isServer){
    console.log("Hello server");
}

InventList = new Mongo.Collection('inventory', {idGeneration: 'MONGO'});
JournalList = new Mongo.Collection('journal', {idGeneration: 'MONGO'});

