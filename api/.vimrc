" autoload the local .vimrc file you need to have
" https://github.com/MarcWeber/vim-addon-local-vimrc
" plugin installed

let g:ctrlp_custom_ignore = '\.git$\|\.tmp$\|node_modules$\|bower_components$'

let g:syntastic_mode_map = {'mode': 'passive', 'active_filetypes': ['javascript']}
let g:syntastic_javascript_jshint_args = '-c .jshintrc'
let g:syntastic_check_on_open = 1

nnoremap <Leader>t :!mocha --recursive --reporter spec --colors test/<CR>
nnoremap <Leader>f :!mocha --reporter spec --colors %<CR>

nnoremap <silent> <Leader>o :call ToggleOnlyOnNearTestCase()<CR>:w<CR>

nnoremap <silent> <Leader>s :call ToggleSkipOnNearTestCase()<CR>:w<CR>
nnoremap <silent> <Leader>S :%s/\(\s\+\)it(/\1xit(/<CR>:noh<CR>:w<CR><C-O>
nnoremap <silent> <Leader>U :%s/\(\s\+\)xit(/\1it(/<CR>:noh<CR>:w<CR><C-O>


function! ToggleSkipOnNearTestCase()
  let l:line=search('^\s\+x\?it(', 'bcnW')
  if l:line > 0
    let l:declaration = getline(l:line)
    if l:declaration =~? '\s\+it('
      let l:toggled = substitute(l:declaration, "it", "xit", "")
    else
      let l:toggled = substitute(l:declaration, "xit", "it", "")
    endif
    call setline(l:line, l:toggled)
  endif
endfunction

function! ToggleOnlyOnNearTestCase()
  let l:line=search('^\s\+it\(.only\)\?(', 'bcnW')
  if l:line > 0
    let l:declaration = getline(l:line)
    if l:declaration =~? '\s\+it.only('
      let l:toggled = substitute(l:declaration, "it.only", "it", "")
    else
      let l:toggled = substitute(l:declaration, "it", "it.only", "")
    endif
    call setline(l:line, l:toggled)
  endif
endfunction
