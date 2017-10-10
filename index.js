/*
	basic UML: object design is 1) what it is 2) what it does

	potential smart object: 1) what it is 2) what it does 3) what it KNOWS
*/

$(function() {
	console.log('ready');

	// define Masterscope class	
	var Masterscope = function(params){

		var self = this;
		self.state = {};
		self.model = {
			templates: {
				field : function(params){
					var returnString = '<div class="tile">'
											+ params.label
											+ ': '
											+ params.field;
					return returnString;
				},
				objectViewer : function(params){
					var returnString = '<div class = "tile">'
											+ params.objectName
											+ ': '
											+ params.content;
					return returnString;				
				}
			},
			insertionPoints: {
				emptybox: $('#target')
			}
		};		
		self.model.contentTypeHandlers = [];
		self.model.objects = params.objects ? params.objects : (console.log('There are no renderable objects.'), null);		
		
		// Rendering is in the Controller's Scope 
		// View Template is chosen based on 'objectName'
		/*
		 * Params: target, content, objectName
		 */

		self.controller = {
			render : function(params){
				var target = params.target ? params.target: (console.log('I need a target to render into.'), null); 
				var content = params.content ? params.content : (console.log('I need content to render.'), null);
				var objectName =params.objectName ? params.objectName :(console.log('I need a name for this object.'), null);
				var $target = $(target);
				
				console.log('content.glossary.title: ' + content.glossary.title);
				console.log('objectName: ' + objectName);

				$(target).append(
					self.model.templates.objectViewer({
						objectName: objectName,
						content: content.glossary.title
					})
				);
				
				return true;
			}
		}
		self.controller.loadContentType = function( params ){
			
			var objectName = params.objectName ? params.objectName : (console.log('Object needs a name'), null);

			var URL 	= params.url ? params.url : ( console.log('I didn\'t find a url'), null );

			var cb 		= params.callback ? params.callback : ( console.log('I didn\'t find a callback'), null );

			var contentTypeHandler = new self.controller.objectController({
				objectName: objectName,
				url: URL
			})
			self.model.contentTypeHandlers.push( contentTypeHandler );
		};
		self.controller.objectController = function( params ){
			var me = this;
			var url = params.url ? params.url:( console.log( "I didn't find a url" ), null);
			var cb = params.callback ? ( console.log("callback found"), params.callback ):(null);
			var objectName = params.objectName ? params.objectName : (console.log('Object needs a name'),null);
			me.state = {
				variables: {
					isRendered: false
				}
			};						
			me.model = {
				objectName: objectName, 
				data : null,
				url : url,
				cb: cb
			};
			me.controller = {};
			me.controller.fetchAjax = function( index ){
				$.ajax({
				  url: me.model.url
				}).done( function( data ) {
					if( cb ){
						cb( data );
					} else {
						data.content
						// set 'data' to the json response

						me.model.data = data;
						self.model.objects[ index ].content = data;
					}
				}).fail( function( err ){
					console.log('ERROR: Ajax error in contentTypeHandler: ' + err);
				});
			};
			me.controller.refresh = function(){

			};
		};
		self.controller.init = function( callback ){
			$.each( self.model.objects, function( index, value ){
				self.controller.loadContentType( 
					{ 
						objectName: value.objectName,
						url: value.url 
					} 
				);
			});

			if( callback ){
				callback();
			}
		};
		self.controller.loadObjects = function(){
			console.log('About to loop');
			$.each( self.model.contentTypeHandlers, function( index, value ){
				console.log('about to  fetchAjax');
				self.model.contentTypeHandlers[ index ].controller.fetchAjax( index );
			} );
		};
		self.controller.listObjects = function(){
			$.each( self.model.contentTypeHandlers, function( index, value ){
				console.dir(value);
			} );
		};		
		self.controller.init( self.controller.loadObjects );
		setTimeout(function() {
			$.each( self.model.objects, function( index, value ){
				self.controller.render(
					{
						target: self.model.insertionPoints.emptybox,
						content: value.content,
						objectName: value.objectName
					}
				)
			});
		}, 1000);
	};

	// define objectController class

	// create a Masterscope

	/*
	 *  
	 */
	var masterscope = new Masterscope({
		objects:[
			{
				objectName: 'textualContent',
				url: 	  './data.json' 
			},
			{
				objectName: 'docs',
				url: 	  './docs.json' 
			},
			{
				objectName: 'links',
				url: 	  './link.json' 
			}
		]

	});

});