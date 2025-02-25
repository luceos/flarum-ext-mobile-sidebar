import app from 'flarum/forum/app';
import { extend, override } from 'flarum/common/extend';
import ItemList from 'flarum/common/utils/ItemList';
import DiscussionComposer from 'flarum/forum/components/DiscussionComposer';
import LogInModal from 'flarum/forum/components/LogInModal';
import Button from 'flarum/common/components/Button';
import IndexPage from 'flarum/forum/components/IndexPage';
import HeaderSecondary from 'flarum/common/components/HeaderSecondary';
import HeaderPrimary from 'flarum/common/components/HeaderPrimary';
import Search from 'flarum/forum/components/Search';
import type Mithril from 'mithril';

app.initializers.add('flarum-mobile-sidebar', function () {

  const newDiscussionItem = (items:  ItemList, order: number = 200) => {
    const canStartDiscussion = app.forum.attribute('canStartDiscussion') || !app.session.user;
    const newDiscussionAction = (): Promise<unknown> => {
      return new Promise((resolve, reject) => {
        if (app.session.user) {
          app.composer.load(DiscussionComposer, { user: app.session.user });
          app.composer.show();
  
          return resolve(app.composer);
        } else {
          app.modal.show(LogInModal);
  
          return reject();
        }
      });
    }

    items.add(
      'newDiscussion',
      <Button
        icon="fas fa-edit"
        className="Button Button--primary IndexPage-newDiscussion"
        itemClassName="App-primaryControl"
        onclick={() => {
          // If the user is not logged in, the promise rejects, and a login modal shows up.
          // Since that's already handled, we dont need to show an error message in the console.
          return newDiscussionAction().catch(() => {});
        }}
        disabled={!canStartDiscussion}
      >
        {app.translator.trans(`core.forum.index.${canStartDiscussion ? 'start_discussion_button' : 'cannot_start_discussion_button'}`)}
      </Button>,
      order
    );
  }

  extend(HeaderPrimary.prototype, 'items', function (items) {
    items.add('search', <Search state={app.search} />, 30);
    newDiscussionItem(items);
  });

  extend(HeaderSecondary.prototype, 'items', function (items) {
    // items.remove('search');
    newDiscussionItem(items, 30);
  });

  extend(IndexPage.prototype, 'sidebarItems', function (items) {
    items.remove('newDiscussion');
  });

  extend(IndexPage.prototype, 'view', function (items) {

      this.appElement = document.getElementsByClassName('IndexPage-nav')[0];
      
      this.isOpen = function(){
        return this.appElement.classList.contains('sideNavOpen');
      }

      this.show = function() {

        this.appElement.classList.add('sideNavOpen');
        this.$backdrop = $('<div/>').addClass('drawer-backdrop fade')
          .css('z-index','8888')
          .appendTo('body')
          .on('click', this.hide.bind(this));

        requestAnimationFrame(() => {
          this.$backdrop.addClass('in');
        });
      }

      this.hide = function() {
        this.appElement.classList.remove('sideNavOpen');
        this.$backdrop?.remove?.();
      }

      document.getElementById('content').addEventListener('click', (e) => {
        if (this.isOpen()) {
          e.preventDefault();
          this.hide();
        }
      });

      if($('.IndexPage-nav.sideNav').find('.sidebaricon').length < 1){
        $('.IndexPage-nav.sideNav').prepend('<div id="sidebaricon" class="sidebaricon"></div>');
        if(document.getElementById('sidebaricon')){
          m.mount(document.getElementById('sidebaricon'), {view: () => <Button icon="fas fa-stream" onclick={(e: MouseEvent) => {
            e.stopPropagation();
            if(!this.isOpen()){
              this.show();
            }else{
              this.hide();
            }
            
          }}>MENU</Button>})
        } 
      }

  });

    

});