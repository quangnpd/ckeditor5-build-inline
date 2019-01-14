/* eslint-disable */
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

import imageIcon from '@ckeditor/ckeditor5-core/theme/icons/image.svg';
import FileDialogButtonView from '@ckeditor/ckeditor5-upload/src/ui/filedialogbuttonview';
import { isImageType } from '@ckeditor/ckeditor5-image/src/imageupload/utils';
import ImageUploadCommand from '@ckeditor/ckeditor5-image/src/imageupload/imageuploadcommand';
import FileRepository from '@ckeditor/ckeditor5-upload/src/filerepository';

class ImageChangeCommand extends ImageUploadCommand {
	/**
	 * @inheritDoc
	 */
	refresh() {
		this.isEnabled = true;
	}
}

export default class InsertImage extends Plugin {
	init() {
		const editor = this.editor;
		// eslint-disable-next-line
		editor.commands.add( 'imageChange', new ImageChangeCommand( editor ) );

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
				}
			} );

			return view;
		} );
	}
}
