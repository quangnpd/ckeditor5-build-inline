/* eslint-disable */
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

import imageIcon from '@ckeditor/ckeditor5-core/theme/icons/image.svg';
import FileDialogButtonView from '@ckeditor/ckeditor5-upload/src/ui/filedialogbuttonview';
import { isImageType } from '@ckeditor/ckeditor5-image/src/imageupload/utils';
import ImageUploadCommand from '@ckeditor/ckeditor5-image/src/imageupload/imageuploadcommand';
import FileRepository from '@ckeditor/ckeditor5-upload/src/filerepository';
import { findOptimalInsertionPosition } from '@ckeditor/ckeditor5-widget/src/utils';

class ImageChangeCommand extends ImageUploadCommand {
	/**
	 * @inheritDoc
	 */
	refresh() {
		this.isEnabled = true;
	}

	/**
	 * Executes the command.
	 *
	 * @fires execute
	 * @param {Object} options Options for the executed command.
	 * @param {File|Array.<File>} options.file The image file or an array of image files to upload.
	 */
	execute( options ) {
		const editor = this.editor;
		const model = editor.model;

		const fileRepository = editor.plugins.get( FileRepository );

		model.change( writer => {
			const filesToUpload = Array.isArray( options.file ) ? options.file : [ options.file ];

			for (const file of filesToUpload) {
				const loader = fileRepository.createLoader( file );

				// Do not throw when upload adapter is not set. FileRepository will log an error anyway.
				if (!loader) {
					return;
				}

				const imageElement = writer.createElement( 'image', { uploadId: loader.id } );

				const insertAtSelection = model.document.selection;

				model.insertContent( imageElement, insertAtSelection );

				writer.setSelection( null );
			}
		} );
	}
}

function disableDeleteAndInput( editor, model ) {
	model.change( () => {
		let uploadCommand = editor.commands.get( 'imageUpload' );

		let inputCommand = editor.commands.get( 'input' );
		let deleteCommand = editor.commands.get( 'delete' );
		let forwardDeleteCommand = editor.commands.get( 'forwardDelete' );
		inputCommand.unbind( 'isEnabled' );
		inputCommand.bind( 'isEnabled' ).to( uploadCommand );
		deleteCommand.unbind( 'isEnabled' );
		deleteCommand.bind( 'isEnabled' ).to( uploadCommand );
		forwardDeleteCommand.unbind( 'isEnabled' );
		forwardDeleteCommand.bind( 'isEnabled' ).to( uploadCommand );
	} );
}

export default class ChangeImage extends Plugin {
	init() {
		const editor = this.editor;
		// eslint-disable-next-line
		editor.commands.add( 'imageChange', new ImageChangeCommand( editor ) );

		disableDeleteAndInput( editor, editor.model );

		editor.ui.componentFactory.add( 'imageInsert', locale => {
			const view = new FileDialogButtonView( locale );

			view.set( {
				acceptedType: 'image/*',
				allowMultipleFiles: true
			} );

			view.buttonView.set( {
				label: 'Change image',
				icon: imageIcon,
				tooltip: true
			} );

			view.on( 'done', ( evt, files ) => {
				const imagesToUpload = Array.from( files ).filter( isImageType );

				if (imagesToUpload.length) {
					editor.execute( 'imageChange', { file: imagesToUpload } );
					disableDeleteAndInput( editor, editor.model );
				}
			} );

			return view;
		} );
	}
}
