# Dry run: setting up BIO the way an activist would

This is a rehearsal. The goal is to find out where a person with no technical
background gets stuck, so we can fix it before anyone else tries.

Nothing here needs a terminal or command line. Everything is done in a web
browser by clicking and typing.

Please do it in order, and please do not fix anything you notice going wrong.
Getting stuck is the useful outcome. Note where it happened and keep going if
you can.

Budget about 25 minutes.

## What you'll end up with

Your own private copy of the BIO system, running on the internet, at a web
address only you know. It will be empty. We will delete it afterwards.

## Before you start

You need three things, and one of them costs money in principle.

**A throwaway email address.** Anything works.

**A payment card.** The storage service will not turn on without a card on
file, even though we will stay far inside the free allowance and expect to be
charged nothing. This is the single biggest obstacle in the whole process and
the main thing we're testing.

**A willingness to make two new accounts.** One for code hosting, one for the
service that runs it. Neither requires you to create or upload anything.

## Step 1: A code hosting account

Go to github.com and sign up with the throwaway email. Confirm the email when
it arrives.

That's all. You will not write any code, create anything, or upload anything.
The deploy step later makes its own copy of the BIO files into this account
automatically. This account exists to be the place that copy lands.

Note how long the signup takes and whether anything about it is confusing or
off-putting. A community volunteer being told to sign up for a programmers'
website is a real friction point and I want your read on how bad it is.

## Step 2: The account that runs it

Go to dash.cloudflare.com and sign up, again with the throwaway email. Confirm
the email.

Skip anything asking you to add a website or domain. You don't need one.

## Step 3: Turn on storage and add the card

In the left sidebar, find and click **R2**.

It will ask for a payment method before it will let you do anything. Add the
card.

Write down what this screen actually says, word for word if you can. If a
volunteer group is going to balk anywhere, it's here, and I want to know
exactly what they're looking at when they do.

## Step 4: Deploy

Open this address:

```
https://deploy.workers.cloudflare.com/?url=https://github.com/believeinoakland/bio-plane
```

That points at the shared BIO copy of the software. You are not deploying
anything of your own; you are asking the service to make you a private copy of
the standard one.

Follow what it asks. It will want permission to connect to your GitHub account,
and it will want you to confirm which account to deploy into.

At some point it should ask you to fill in three values with names like
`ADMIN_TOKEN`, `MEMBER_TOKEN` and `PROBE_TOKEN`. These are passwords for the
system. Make up three different long random-looking strings, or use a password
manager's generator. Write down all three before you continue, because you will
not be able to look them up again afterwards.

**If it does not ask for those three values, that is important. Tell me.**

Then let it deploy. It takes a few minutes.

When it finishes it will show you a web address ending in `workers.dev`. Copy
it.

## Step 5: Check whether it worked

Open this in your browser, pasting in your address and the third password:

```
https://YOUR-ADDRESS-HERE/?op=selftest&token=YOUR-PROBE-TOKEN
```

You'll get a block of text. Send it to me exactly as it appears. It's harmless
to share; the third password is deliberately the weak one and I'll explain why
separately.

Then open the same address with `selftest` changed to `livefire`:

```
https://YOUR-ADDRESS-HERE/?op=livefire&token=YOUR-PROBE-TOKEN
```

Send me that too. It's longer.

If either one shows an error instead, send me the error. That's a result, not a
failure.

## What I need back

1. The two blocks of text from step 5, or whatever appeared instead.
2. The web address ending in `workers.dev`.
3. The third password (`PROBE_TOKEN`) only. Keep the other two.
4. Roughly how long each step took, and which step was worst.
5. Anything the screen said that you didn't understand. Especially anything you
   had to guess at. Those are the sentences the wizard has to replace.
6. Whether the deploy asked you for the three passwords, and if so, what it said
   about them.

## Afterwards

Don't delete anything yet. I may want to run tests against it. Once we're done
I'll walk you through removing it, which is quick, and then the card can come
off the account.
