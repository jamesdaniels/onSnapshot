import { OnsnapshotPage } from './app.po';

describe('onsnapshot App', function() {
  let page: OnsnapshotPage;

  beforeEach(() => {
    page = new OnsnapshotPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
